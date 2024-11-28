// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

contract AdminSensorManagement {
    address public admin;

    // Mapping for allowed sensors and owners
    mapping(address => bool) public allowedSensors;
    mapping(address => bool) public allowedOwners;

    // Events
    event SensorAdded(address sensor);
    event OwnerAdded(address owner);
    event SensorRemoved(address sensor);
    event OwnerRemoved(address owner);

    constructor() {
        admin = msg.sender; // Admin is the deployer of the contract
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    // Function for admin to add allowed sensors
    function addSensor(address sensor) public onlyAdmin {
        require(!allowedSensors[sensor], "Sensor already added");
        allowedSensors[sensor] = true;
        emit SensorAdded(sensor);
    }

    // Function for admin to remove allowed sensors
    function removeSensor(address sensor) public onlyAdmin {
        require(allowedSensors[sensor], "Sensor not found");
        allowedSensors[sensor] = false;
        emit SensorRemoved(sensor);
    }

    // Function for admin to add allowed owners
    function addOwner(address owner) public onlyAdmin {
        require(!allowedOwners[owner], "Owner already added");
        allowedOwners[owner] = true;
        emit OwnerAdded(owner);
    }

    // Function for admin to remove allowed owners
    function removeOwner(address owner) public onlyAdmin {
        require(allowedOwners[owner], "Owner not found");
        allowedOwners[owner] = false;
        emit OwnerRemoved(owner);
    }
}

