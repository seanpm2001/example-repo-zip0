let hook;

module.exports = () => {
  if (typeof hook === `undefined`)
    hook = require('zlib').brotliDecompressSync(Buffer.from('GzAfABynw5pcuBFmTv/70/1/f76uO9EY2rrhxLEWYC/7pSrhkeCCoArnFYpOj/QE6fHx/9uvLDqs7BiRsBXp++jMh+HuCQG8qpo/jQFCBS4aVBSu82uBpBshV9hdhtNJ5SY01hAgQGf92Yk6uIWH23NmLWpvI/fq4YaC6ep7dbhgBKxrceRcU3/MeT3keq5fx3N9Ilx5x6/unaWRPwdp0d46sZJnmNonGRAEgSIv8bIRDT92SKHtAQS1+L9lk0IfNBmC0P+Bzz15CLp7KzBkg7MGTxSRr0KLpulDDZQHK6cvj0DXQcCXhNZS6vUSVWoDpZrGhKjl/9sMLDCwpasO4JXS8geYKH2eJ98pCISCGGIZ4f0EaPFVw6g1hHTtBMdGyaSAuIZznuByTQOKR+LTBZo9rNzUzxL41JB6UziDRdbK0SYtv251lGn4hAgwg66Aaqv6ZEIZ0Glk1ao5SNj3hemgByM/NLvnHGNGyYqQdSDAFDwRbZR/GVlM9K/FKKgtRlFPW0xrpIgH67IWOYJlE2PG0zV27p0jullnFUVkSvzj5QsApadVRvHUzgOgo1qvQVHRRAASexPTNYoC0yFbG1ADE2KhwmAFv5JR01WNmnysDJIogK3pwpzAuvhRO62KvbhKLUF2R3M2ukvVxejf7OSXCM4b8aPFv53F19Dl83TaQXmmh8u9EVp/8OWDJOBBQLfIu95p7sRTrw6riWKuaMoE/W0BT5UJHI5qyvG4WEcqml41oasr+GsnRPBblktDNEsyp1c/MgMVNXocu09syuR6iVpfHAUpQ/yf5HqJXd+lAsENt8hQgE2CvuOd/oTqqrDJMKauNt0SA8M/CGwB8iBAcCFa0K3D0KJkcaXp765U3xk4TsF45+jqWUT9R4yaxKmKDOIExgdFSL2YeadftqAz3RIIPi+3OIfc0y9VOMHEc+fkaYUvW1JlnDkJqy/pGJkRFM4gSY7cqTFZ+iCl9uE232WGhHbiMI2uK4vhzFqUSW2iTrAx4BKkxfxtUu/SQV4lPhkN8nuQbWf4yLvyd/0jMmzj/yJNwad8eINyJZe0ywrJdYRi2LxYGvi9I3dZBWOVUXUP0rgA7S4/yrkyih21s3aNiCX1VBUUPWqavm4Yo9sCkCEWF0xX6jPKggcrc/BWUq7D6ZZDZrVXjDzIukbrinQSULi4V2hPaRMqdFzWwQLQ9lIQnpapOltQBpvUFC71QbYAtFrclZVlhaWc28KX63KdiE67bUYcBIqtVndrDmot0Q/IJ/pvLX29EGcNg/eaFsMlSP2UQu/ZjL13v2VC6F2NUr9Bg1CPox1NU6MAKeGPGw3heVhj8nWkCZQaalymuab+vcUkz4g9fyyK+CtZ1KCzJte88qkMFdU4QUBpxc5JDYmpYj0lEPtGMBN58CEHl1cHl/djakVPATD/avUNmOIttSU+XcYGdxb/XrSpJ+Q8ChXIl/bGQh4ri8ysI//r96HyNlhFOSpQ60aRF/lrsh/jq/bzX1FpNCRw5l7ifgKgKkGL0vsi/xxrdA2/wMRWoikHOEtOuK551bGet3xH+nM0tZJqaP81lrj1OoS2HoF8EjmfbCppTLdrdDeLlA3sbfKPQJ6Uo02W0dTfiynMpUPlWwYz/l5M7riTjCIQtDJ+xH0UKukWGcNbANHR1S/Pem7PjFKJDJ9sRWumByRHqKds38JII8HAEWSQo7ze1B8gTF2JWL6REzgVGp04K/vgouudFCqouwPVtLvHuADVhXSGz50i3URqsWYOnFtobc3WM5XLMwDrlxNkU4VNxwg3V02DdNyUl3pV0ApHozKVXlWC6mLSW6jOXC/r1c23U/FkmTiGpPrQhFZBc/+vcxWlSlPm1YTztjso680JXVQ3cWC4spuBmydcGIdM84Kw+FShErEoWWVtOV/XPVfEx7cm5oP8IHDCrgb3FV3A2z47S7bcwOmmKSW/9S1VmrnbOmjbf3PChboxvZxEA2ee8Pmulhy1FUmetU9t+ZWHcPuUXGa1EopbhB7qkvU3aHNZptdltVNJC6J908WAwd0Ruq5ekJAjdKmin5MntvnxCn9nEGj06qUIQ9YjhsBjChJCYpgaK9IOU5gsYnK22OjhJvcasLumq6MFP7QgeDoNUJs6WBjulWCLnS29IwW3qVVJ9anKKqokl94u/gvCpDMtwqH61i1g/zIK7qtZEzOYKjaiktuVO40kvz0vWoM3YaQm79KqmRf1q/BNHghpvQCDCJ4iz1ak/K/ks+edjG5ipd81BCGdq5QJLHvrJZK2WYvhOoiYKXnolnv1UN5++EqZpRXJCKPLrVMFKpl5hB6b0je+Oms3eSFyxbAOE3pIjqCg6UvCi/QVKYVv8YZ0RABb9rmNFmEOr7t1Fk11d24+zCS9gc5CVTclE909oExrTXHhBS0x3CP4TJ59GTvih5K5coxfcUy58EzjWFkWMDfdSjlq59pFEU7iIpD7HbtgufaEpv5we7xKwhb3XC5SbMkm5FcW2oLW5RobgTRFrsy1KawVNedhCvjvvp5cjw73QRgOlteW15dWl9e9oIMOi3dxzqO60K7MyX6eMo3Odhn2NUyd/Q8Bap7MljyFWW7ksXB/jSGuAVHarS0CEQRKhDC7oPaqzCFfpsdCy0pV+8HcxINa7qGHHyoyq8v7VrX0YQqg8iaeZl8sGD2r0TEr+1Wj4x0bmZ6WUHSr2bx3/PGu5d/zsmmxKglKna2lnstwta3+nqyEhQZBe4QKV+1KkZp5HS1l75WuhJZuvd9bmt6KHrwf2f7kE8iR8s+oImRLwXVi6Fum4EeYQb9lUh8LyKgqe9A/FpksPVbqXYPY7G3ansEqdF3IClEzzIKkmQubjcGQlnUTOq9KF1u98uogWAaJ3eBDErzN3rzz0Y5UGZggNlcV6uBKsdqrl1VeAq04LUyMnCENsPVETgA=', 'base64')).toString();

  return hook;
};
