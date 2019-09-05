import {BaseCommand, WorkspaceRequiredError}                                       from '@yarnpkg/cli';
import {Configuration, MessageName, Project, ReportError, StreamReport, Workspace} from '@yarnpkg/core';
import {miscUtils, structUtils}                                                    from '@yarnpkg/core';
import {npmConfigUtils, npmHttpUtils}                                              from '@yarnpkg/plugin-npm';
import {packUtils}                                                                 from '@yarnpkg/plugin-pack';
import {Command, UsageError}                                                       from 'clipanion';
import {createHash}                                                                from 'crypto';
import ssri                                                                        from 'ssri';

// eslint-disable-next-line arca/no-default-export
export default class NpmPublishCommand extends BaseCommand {
  @Command.String(`--access`)
  access?: string;

  @Command.String(`--tag`)
  tag: string = `latest`;

  @Command.Boolean(`--tolerate-republish`)
  tolerateRepublish: boolean = false;

  static usage = Command.Usage({
    category: `Npm-related commands`,
    description: `publish the active workspace to the npm registry`,
    details: `
      This command will pack the active workspace into a fresh archive and upload it to the npm registry.

      The package will by default be attached to the \`latest\` tag on the registry, but this behavior can be overriden by using the \`--tag\` option.

      Note that for legacy reasons scoped packages are by default published with an access set to \`restricted\` (aka "private packages"). This requires you to register for a paid npm plan. In case you simply wish to publish a public scoped package to the registry (for free), just add the \`--access public\` flag. This behavior can be enabled by default through the \`npmPublishAccess\` settings.
    `,
    examples: [[
      `Publish the active workspace`,
      `yarn npm publish`,
    ]],
  });

  @Command.Path(`npm`, `publish`)
  async execute() {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
    const {workspace} = await Project.find(configuration, this.context.cwd);

    if (!workspace)
      throw new WorkspaceRequiredError(this.context.cwd);

    if (workspace.manifest.private)
      throw new UsageError(`Private workspaces cannot be published`);
    if (workspace.manifest.name === null || workspace.manifest.version === null)
      throw new UsageError(`Workspaces must have valid names and versions to be published on an external registry`);

    // We store it so that TS knows that it's non-null
    const ident = workspace.manifest.name;
    const version = workspace.manifest.version;

    const registry = npmConfigUtils.getPublishRegistry(workspace.manifest, {configuration});

    const report = await StreamReport.start({
      configuration,
      stdout: this.context.stdout,
    }, async report => {
      // Not an error if --tolerate-republish is set
      if (this.tolerateRepublish) {
        try {
          const registryData = await npmHttpUtils.get(npmHttpUtils.getIdentUrl(ident), {
            configuration,
            registry,
            ident,
            json: true,
          });

          if (!Object.prototype.hasOwnProperty.call(registryData, `versions`))
            throw new ReportError(MessageName.REMOTE_INVALID, `Registry returned invalid data for - missing "versions" field`);

          if (Object.prototype.hasOwnProperty.call(registryData.versions, version)) {
            report.reportWarning(MessageName.UNNAMED, `Registry already knows about version ${version}; skipping.`);
            return;
          }
        } catch (error) {
          if (error.name !== `HTTPError`) {
            throw error;
          } else if (error.statusCode !== 404) {
            throw new ReportError(MessageName.NETWORK_ERROR, `The remote server answered with HTTP ${error.statusCode} ${error.statusMessage}`);
          }
        }
      }

      await packUtils.prepareForPack(workspace, {report}, async () => {
        const files = await packUtils.genPackList(workspace);

        for (const file of files)
          report.reportInfo(null, file);

        const pack = await packUtils.genPackStream(workspace, files);
        const buffer = await miscUtils.bufferStream(pack);

        const body = await makePublishBody(workspace, buffer, {
          access: this.access,
          tag: this.tag,
        });

        try {
          await npmHttpUtils.put(npmHttpUtils.getIdentUrl(ident), body, {
            configuration,
            registry,
            json: true,
          });
        } catch (error) {
          if (error.name === `HTTPError`) {
            const message = error.body && error.body.error
              ? error.body.error
              : `The remote server answered with HTTP ${error.statusCode} ${error.statusMessage}`;

            report.reportError(MessageName.NETWORK_ERROR, message);
          } else {
            throw error;
          }
        }
      });

      if (!report.hasErrors()) {
        report.reportInfo(MessageName.UNNAMED, `Package archive published`);
      }
    });

    return report.exitCode();
  }
}

async function makePublishBody(workspace: Workspace, buffer: Buffer, {access, tag}: {access: string | undefined, tag: string}) {
  const configuration = workspace.project.configuration;

  const ident = workspace.manifest.name!;
  const version = workspace.manifest.version!;

  const name = structUtils.stringifyIdent(ident);

  const shasum = createHash('sha1').update(buffer).digest('hex');
  const integrity = ssri.fromData(buffer).toString();

  if (typeof access === `undefined`) {
    if (workspace.manifest.publishConfig && typeof workspace.manifest.publishConfig.access === `string`) {
      access = workspace.manifest.publishConfig.access;
    } else if (configuration.get(`npmPublishAccess`) !== null) {
      access = configuration.get(`npmPublishAccess`);
    } else if (ident.scope) {
      access = `restricted`;
    } else {
      access = `public`;
    }
  }

  const raw = await packUtils.genPackageManifest(workspace);

  return {
    _id: name,
    _attachments: {
      [`${name}-${version}.tgz`]: {
        [`content_type`]: `application/octet-stream`,
        data: buffer.toString(`base64`),
        length: buffer.length,
      },
    },

    name,
    access,

    [`dist-tags`]: {
      [tag]: version,
    },

    versions: {
      [version]: {
        ...raw,

        _id: `${name}@${version}`,

        name,
        version,

        dist: {
          shasum,
          integrity,

          // the npm registry requires a tarball path, but it seems useless 🤷
          tarball: `https://example.org/yarn/was/here.tgz`,
        },
      },
    },
  };
}
