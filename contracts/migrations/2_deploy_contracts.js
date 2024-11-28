//const PatientSensorContract = artifacts.require("DeviceOwner");
//const PatientContract = artifacts.require("PatientRecord");
//const TransactionInfoStorage = artifacts.require("TransactionInfoStorage");
//module.exports = function (deployer) {
//    deployer.deploy(PatientSensorContract);
//    deployer.deploy(PatientContract);
//    deployer.deploy(TransactionInfoStorage);
//};

const AdminSensorManagement = artifacts.require("AdminSensorManagement");
const PatientSensorLink = artifacts.require("PatientSensorLink");

module.exports = async function (deployer) {
  // Deploy AdminSensorManagement first
  await deployer.deploy(AdminSensorManagement);

  // Get deployed instance of AdminSensorManagement
  const adminSensorManagementInstance = await AdminSensorManagement.deployed();

  // Deploy PatientSensorLink with the address of AdminSensorManagement
  await deployer.deploy(PatientSensorLink, adminSensorManagementInstance.address);
};


