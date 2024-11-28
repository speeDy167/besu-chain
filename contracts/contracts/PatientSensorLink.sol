// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./AdminSensorManagement.sol";

contract PatientSensorLink {
    AdminSensorManagement public adminContract;

    // Mapping for linking patients to sensors
    mapping(address => address[]) public patientSensors;

    // Events
    event SensorLinked(address patient, address sensor);
    event SensorUnlinked(address patient, address sensor);

    constructor(address adminContractAddress) {
        adminContract = AdminSensorManagement(adminContractAddress);
    }

    modifier onlyAuthorizedOwner() {
        require(
            adminContract.allowedOwners(msg.sender),
            "Only authorized owners can call this function"
        );
        _;
    }

    // Function to link a patient with a sensor
    function linkSensor(address patient, address sensor) public onlyAuthorizedOwner {
        require(adminContract.allowedSensors(sensor), "Sensor not authorized");
        patientSensors[patient].push(sensor);
        emit SensorLinked(patient, sensor);
    }

    // Function to unlink a specific sensor from a patient
    function unlinkSensor(address patient, address sensor) public onlyAuthorizedOwner {
        require(adminContract.allowedOwners(msg.sender), "Not an authorized owner");

        address[] storage sensors = patientSensors[patient];
        bool found = false;

        for (uint256 i = 0; i < sensors.length; i++) {
            if (sensors[i] == sensor) {
                sensors[i] = sensors[sensors.length - 1]; // Replace with the last element
                sensors.pop(); // Remove the last element
                found = true;
                break;
            }
        }

        require(found, "Sensor not linked to this patient");
        emit SensorUnlinked(patient, sensor);
    }

    // Get all sensors linked to a patient
    function getPatientSensors(address patient) public view returns (address[] memory) {
        return patientSensors[patient];
    }
}

