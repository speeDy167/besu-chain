// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract DeviceOwner {

    struct Sensor {
        address owner;
        bool isActive;
    }

    mapping(address => mapping(address => Sensor)) public patientSensors;
    mapping(address => address) public patientOwners; // Keeps track of who owns each patient

    event SensorAdded(address indexed patient, address indexed sensor);
    event SensorRevoked(address indexed patient, address indexed sensor);
    event DataPushed(address indexed patient, address indexed sensor, string data);

    modifier onlySensorOwner(address patient, address sensor) {
        require(patientSensors[patient][sensor].owner == msg.sender, "Caller is not the sensor owner");
        _;
    }

    // Set the patient owner when creating the patient record (optional, for future access control)
    function setPatientOwner(address patient, address owner) public {
        require(patientOwners[patient] == address(0), "Patient already has an owner");
        patientOwners[patient] = owner;
    }

    // Function to add a sensor for a patient
    function addSensorForPatient(address patient, address sensor) public {
        require(patientOwners[patient] == msg.sender, "Only the patient owner can add sensors");
        require(patientSensors[patient][sensor].isActive == false, "Sensor already added");

        patientSensors[patient][sensor] = Sensor({
            owner: msg.sender,
            isActive: true
        });

        emit SensorAdded(patient, sensor);
    }

    // Function to revoke a sensor for a patient
    function revokeSensorForPatient(address patient, address sensor) public onlySensorOwner(patient, sensor) {
        require(patientSensors[patient][sensor].isActive == true, "Sensor is not active");

        patientSensors[patient][sensor].isActive = false;

        emit SensorRevoked(patient, sensor);
    }

    // Function for the sensor to push data for a patient
    function pushDataForPatient(address patient, string memory data) public {
        require(patientSensors[patient][msg.sender].isActive == true, "Sensor not authorized or inactive");

        emit DataPushed(patient, msg.sender, data);
    }
}

