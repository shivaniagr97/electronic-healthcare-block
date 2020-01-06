/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Create New Report
 * @param {org.electronic.healthcare.AddNewReport} report
 * @transaction
 */
async function addNewReport(report) {
    let assetRegistry = await getAssetRegistry('org.electronic.healthcare.Report');
    var factory = getFactory()

    num_id = (Math.floor(Math.random() * ( 999999 - 100000) + 100000)).toString(10)

    var assetID = report.patient.emailId + num_id;
    var newAsset = factory.newResource('org.electronic.healthcare','Report',assetID)
    newAsset.patient = factory.newRelationship('org.electronic.healthcare','Patient',report.patient.getIdentifier());
    newAsset.doctor = factory.newRelationship('org.electronic.healthcare','Doctor',report.patient.currentDoctor.getIdentifier());
    newAsset.description = report.description;
    newAsset.date = report.date;

    await assetRegistry.add(newAsset);

    report.outstandingBalance.outstandingBalance += report.patient.currentDoctor.consultancyFee

    const assetRegistry2 = await getAssetRegistry('org.electronic.healthcare.OutstandingBalance')
    await assetRegistry2.update(report.outstandingBalance)

}

/**
 * Create new patient
 * @param {org.electronic.healthcare.AddNewPatient} patient
 * @transaction
 */
async function addNewPatient(patient)
{
    let patientAsset = await getParticipantRegistry('org.electronic.healthcare.Patient');
    var factory = getFactory();
    var patientId = patient.emailId;
    var patientCreated = factory.newResource('org.electronic.healthcare','Patient',patientId);
    patientCreated.name = patient.name;
    patientCreated.address = patient.address;
    patientCreated.bloodGroup = patient.bloodGroup;
    patientCreated.contactNumber = patient.contactNumber;
    await patientAsset.add(patientCreated);

    let assetRegistry = await getAssetRegistry('org.electronic.healthcare.OutstandingBalance');
    var factory = getFactory()

    var assetID = patient.emailId;
    var newAsset = factory.newResource('org.electronic.healthcare','OutstandingBalance',assetID);
    newAsset.patient = factory.newRelationship('org.electronic.healthcare','Patient',patientCreated.getIdentifier());
    await assetRegistry.add(newAsset);
}

/**
 * Create New Hospital
 * @param {org.electronic.healthcare.AddNewHospital} hospital
 * @transaction
 */

async function addNewHospital(hospital){
    let hospitalAsset = await getParticipantRegistry('org.electronic.healthcare.Hospital');
    var factory = getFactory();
    var hospitalId = hospital.hospitalId;
    var hospitalCreated = factory.newResource('org.electronic.healthcare','Hospital',hospitalId);
    hospitalCreated.hospitalName = hospital.hospitalName;
    hospitalCreated.address = hospital.address;
    hospitalCreated.contactNumber = hospital.contactNumber;
    await hospitalAsset.add(hospitalCreated);
}

/**
 * Create New doctor
 * @param {org.electronic.healthcare.AddNewDoctor} doctor
 * @transaction
 */
async function addNewDoctor(doctor){
    let doctorAsset = await getParticipantRegistry('org.electronic.healthcare.Doctor');
    var factory = getFactory();
    var doctorId = doctor.emailId;
    var doctorCreated = factory.newResource('org.electronic.healthcare','Doctor',doctorId);
    doctorCreated.name = doctor.name;
    doctorCreated.address = doctor.address;
    doctorCreated.qualifications = doctor.qualifications;
    doctorCreated.contactNumber = doctor.contactNumber;
    doctorCreated.consultancyFee = doctor.consultancyFee;
  	doctorCreated.currentHospital = factory.newRelationship('org.electronic.healthcare','Hospital',doctor.currentHospital.getIdentifier());
    await doctorAsset.add(doctorCreated);
}

/**
 * Change of hospital request by Patient
 * @param {org.electronic.healthcare.PatientRequestsHospital} request
 * @transaction
 */

async function patientRequestsHospital(request)
{
    var factory = getFactory();
    const patient = await getParticipantRegistry('org.electronic.healthcare.Patient');
    request.patient.hasRequestedToChangeHospital = 'TRUE'
    request.patient.requestedHospital = factory.newRelationship('org.electronic.healthcare','Hospital',request.toHospital.getIdentifier());
    await patient.update(request.patient);
}


/**
 * Change of hospital request by doctor
 * @param {org.electronic.healthcare.DoctorRequestsHospital} request
 * @transaction
 */

async function doctorRequestsHospital(request)
{
    var factory = getFactory();
    const doctor = await getParticipantRegistry('org.electronic.healthcare.Doctor');
    request.doctor.hasRequestedToChangeHospital = 'TRUE'
    request.doctor.requestedHospital = factory.newRelationship('org.electronic.healthcare','Hospital',request.toHospital.getIdentifier());
    await doctor.update(request.doctor);
}

/**
 * Change the hospital for patient
 * @param {org.electronic.healthcare.ChangeHospitalForPatient} change
 * @transaction
 */
async function changeHospitalForPatient(change){
    var factory = getFactory();
    let patientStatus = change.patient.hasRequestedToChangeHospital;
    if(patientStatus === 'FALSE'){
        throw new Error ('Patient Has not requested to change his hospital');
    }
    const patient = await getParticipantRegistry('org.electronic.healthcare.Patient');
    change.patient.currentHospital = factory.newRelationship('org.electronic.healthcare','Hospital',change.patient.requestedHospital.getIdentifier());
    change.patient.hasRequestedToChangeHospital = 'FALSE'
    await patient.update(change.patient);
}

/**
 * Change the hospital for doctor
 * @param {org.electronic.healthcare.ChangeHospitalForDoctor} change
 * @transaction
 */
async function changeHospitalForDoctor(change){
    var factory = getFactory();
    let doctorStatus = change.doctor.hasRequestedToChangeHospital;
    if(doctorStatus === 'FALSE'){
        throw new Error ('Doctor Has not requested to change his hospital');
    }
    const doctor = await getParticipantRegistry('org.electronic.healthcare.Doctor');
    change.doctor.currentHospital = factory.newRelationship('org.electronic.healthcare','Hospital',change.doctor.requestedHospital.getIdentifier());
    change.doctor.hasRequestedToChangeHospital = 'FALSE'
    await doctor.update(change.doctor);
}

/**
 * Change the doctor for patient
 * @param {org.electronic.healthcare.ChangeDoctorForPatient} change
 * @transaction
 */
async function changeDoctorForPatient(change){
    var factory = getFactory();
    const patient = await getParticipantRegistry('org.electronic.healthcare.Patient');
    change.patient.currentDoctor = factory.newRelationship('org.electronic.healthcare','Doctor',change.toDoctor.getIdentifier());
    await patient.update(change.patient);
}