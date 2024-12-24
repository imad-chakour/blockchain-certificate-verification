// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerification {
    struct Certificate {
        string name;
        string course;
        uint256 timestamp;
    }

    mapping(string => Certificate) public certificates;

    function addCertificate(string memory certID, string memory name, string memory course) public {
        require(bytes(certificates[certID].name).length == 0, "Certificate already exists");
        certificates[certID] = Certificate(name, course, block.timestamp);
    }

    function verifyCertificate(string memory certID) public view returns (string memory, string memory, uint256) {
        require(bytes(certificates[certID].name).length > 0, "Certificate does not exist");
        Certificate memory cert = certificates[certID];
        return (cert.name, cert.course, cert.timestamp);
    }
}
