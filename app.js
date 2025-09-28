document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('inspectionDate').valueAsDate = new Date();
    
    // Set up form submission
    document.getElementById('inspectionForm').addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = collectFormData();
    
    // For now, just log the data and show an alert
    console.log('Inspection Data:', formData);
    alert('Inspection saved successfully!');
    
    // Clear the form
    clearForm();
}

function collectFormData() {
    const data = {};
    
    // Get text inputs
    data.propertyAddress = document.getElementById('propertyAddress').value;
    data.unitNumber = document.getElementById('unitNumber').value;
    data.inspectionType = document.getElementById('inspectionType').value;
    data.inspectorName = document.getElementById('inspectorName').value;
    data.inspectionDate = document.getElementById('inspectionDate').value;
    data.additionalNotes = document.getElementById('additionalNotes').value;
    
    // Get checked rooms
    data.rooms = [];
    document.querySelectorAll('input[name="rooms"]:checked').forEach(checkbox => {
        data.rooms.push(checkbox.value);
    });
    
    // Get checked issues
    data.issues = [];
    document.querySelectorAll('input[name="issues"]:checked').forEach(checkbox => {
        data.issues.push(checkbox.value);
    });
    
    return data;
}

function clearForm() {
    document.getElementById('inspectionForm').reset();
    document.getElementById('inspectionDate').valueAsDate = new Date();
}
