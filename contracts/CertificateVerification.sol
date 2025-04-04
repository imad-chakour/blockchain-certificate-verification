// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerification {
    
    struct Certificate {
        string certID;    
        string name;      
        string course;    
        uint256 timestamp; 
    }

    Certificate[] public certificates;

// ==================================================

    function addCertificate(string memory certID, string memory name, string memory course) public {
        
        bool certificateExists = false;
        for (uint256 i = 0; i < certificates.length; i++) {
            if (keccak256(bytes(certificates[i].certID)) == keccak256(bytes(certID))) {
                certificateExists = true;
                break;
            }
        }
        if (certificateExists) {
            revert("Certificate already exists");
        } else {
            certificates.push(Certificate(certID, name, course, block.timestamp));
        }
    }

// ==================================================

    function verifyCertificate(string memory certID) public view returns (string memory, string memory, uint256) {

        for (uint256 i = 0; i < certificates.length; i++) {
            if (keccak256(bytes(certificates[i].certID)) == keccak256(bytes(certID))) {
                
                return (certificates[i].name, certificates[i].course, certificates[i].timestamp);
            }
        }
        revert("Certificate does not exist");
    }

}