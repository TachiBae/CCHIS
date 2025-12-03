/**
 * CCHIS Export Service
 * Handles generation of professional PDF medical records
 */

const ExportService = {
    /**
     * Generate and download a complete medical record PDF for a patient
     * @param {string} patientId - The ID of the mother/patient (e.g., 'M001')
     */
    generateMedicalRecordPDF: function (patientId) {
        this.exportPatientToPDF(patientId);
    },

    exportPatientToPDF: function (patientIdentifier) {
        // 1. Get patient data from window.mockData (Source of Truth)
        const mother = window.mockData.mothers.find(m => m.id === patientIdentifier || m.username === patientIdentifier);

        if (!mother) {
            alert('Patient data not found');
            return;
        }

        // Get related data
        const history = window.mockData.motherMedicalHistory ?
            window.mockData.motherMedicalHistory.find(h => h.motherId === mother.id) : null;

        const children = window.mockData.children.filter(c => c.motherId === mother.id);
        const visits = window.mockData.postpartumVisits.filter(v => v.motherId === mother.id);

        // 2. Initialize PDF
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("Error: PDF library not loaded. Please check your internet connection.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let startY = 20;

        // Helper for checking page breaks
        const checkPageBreak = (height = 20) => {
            if (startY + height > 280) {
                doc.addPage();
                startY = 20;
                return true;
            }
            return false;
        };

        // 3. Add Header
        doc.setFontSize(18);
        doc.setTextColor(33, 37, 41);
        doc.setFont("helvetica", "bold");
        doc.text('CCHIS - Patient Medical Record', 105, startY, { align: 'center' });
        startY += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text('Generated: ' + new Date().toLocaleDateString(), 105, startY, { align: 'center' });
        startY += 10;
        doc.text(`Patient ID: ${mother.id}`, 105, startY, { align: 'center' });
        startY += 15;

        // 4. Personal Information Table
        const personalInfoBody = [
            ['Full Name', mother.name || 'N/A'],
            ['Date of Birth', mother.dob || 'N/A'],
            ['Age', mother.age ? mother.age.toString() : 'N/A'],
            ['Civil Status', mother.civilStatus || 'N/A'],
            ['Contact Number', mother.contact || 'N/A'],
            ['Email', mother.email || 'N/A'],
            ['Address', mother.address || 'N/A'],
            ['Emergency Contact', mother.emergencyContact || 'N/A']
        ];

        doc.autoTable({
            startY: startY,
            head: [['Personal Information', '']],
            body: personalInfoBody,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
            styles: { cellPadding: 5, fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
            margin: { left: 14, right: 14 }
        });
        startY = doc.lastAutoTable.finalY + 15;

        // 5. Medical History Table
        checkPageBreak(60);

        // Process Chronic Conditions
        let chronicConditions = "None";
        if (history && history.personalHistory) {
            const conditions = Object.entries(history.personalHistory)
                .filter(([key, value]) => value === true && key !== 'other')
                .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())); // Format camelCase

            if (history.personalHistory.other) conditions.push(history.personalHistory.other);
            if (conditions.length > 0) chronicConditions = conditions.join(', ');
        }

        // Process Allergies & Meds
        const allergies = history?.motherAllergies?.hasAllergies ? history.motherAllergies.list : 'None known';
        const medications = history?.motherMedications || 'None recorded';
        const familyHistory = history?.familyHistory ?
            Object.entries(history.familyHistory)
                .filter(([key, value]) => value === true && key !== 'other')
                .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
                .join(', ') : 'None recorded';

        const medicalHistoryBody = [
            ['Total Pregnancies (Gravida)', mother.gravida ? mother.gravida.toString() : '0'],
            ['Live Births (Para)', mother.para ? mother.para.toString() : '0'],
            ['Chronic Conditions', chronicConditions],
            ['Family History', familyHistory || 'None'],
            ['Known Allergies', allergies],
            ['Current Medications', medications]
        ];

        doc.autoTable({
            startY: startY,
            head: [['Medical History', '']],
            body: medicalHistoryBody,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
            styles: { cellPadding: 5, fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
            margin: { left: 14, right: 14 }
        });
        startY = doc.lastAutoTable.finalY + 15;

        // 6. Postpartum Information Table
        checkPageBreak(50);

        const postpartumBody = [
            ['Delivery Date', mother.deliveryDate || 'N/A'],
            ['Status', mother.status || 'N/A'],
            ['Risk Factors', mother.riskFactors && mother.riskFactors.length > 0 ? mother.riskFactors.join(', ') : 'None'],
            ['Attending Provider', 'Dr. Maria Clara (Midwife)'] // Mocked as per context
        ];

        doc.autoTable({
            startY: startY,
            head: [['Postpartum Information', '']],
            body: postpartumBody,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
            styles: { cellPadding: 5, fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
            margin: { left: 14, right: 14 }
        });
        startY = doc.lastAutoTable.finalY + 15;

        // 7. Postpartum Visit History Table
        checkPageBreak(50);

        // Map visits to table rows
        const visitRows = [
            ['48-Hour Visit', '-', 'Pending', '-', 'N/A'],
            ['7-Day Visit', '-', 'Pending', '-', 'N/A'],
            ['6-Week Visit', '-', 'Pending', '-', 'N/A']
        ];

        if (visits && visits.length > 0) {
            visits.forEach(v => {
                let rowIndex = -1;
                if (v.type.includes('48')) rowIndex = 0;
                else if (v.type.includes('7')) rowIndex = 1;
                else if (v.type.includes('6')) rowIndex = 2;

                if (rowIndex !== -1) {
                    visitRows[rowIndex][1] = v.date || '-';
                    visitRows[rowIndex][2] = v.status || 'Pending';
                    visitRows[rowIndex][3] = v.notes || '-';
                    visitRows[rowIndex][4] = 'Dr. Maria Clara';
                }
            });
        }

        doc.autoTable({
            startY: startY,
            head: [['Visit Type', 'Date', 'Status', 'Findings', 'Provider']],
            body: visitRows,
            theme: 'striped',
            headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
            styles: { cellPadding: 5, fontSize: 10 },
            margin: { left: 14, right: 14 }
        });
        startY = doc.lastAutoTable.finalY + 15;

        // 8. Child Information Section (Loop)
        if (children && children.length > 0) {
            children.forEach((child, index) => {
                checkPageBreak(100);

                // Child Header
                doc.setFontSize(14);
                doc.setTextColor(33, 37, 41);
                doc.setFont("helvetica", "bold");
                doc.text(`Child ${index + 1}: ${child.name}`, 14, startY);
                startY += 8;

                // Child Info Table
                const childInfoBody = [
                    ['Date of Birth', child.birthDate || 'N/A'],
                    ['Sex', child.sex || 'N/A'],
                    ['Birth Weight', (child.birthWeight ? child.birthWeight + ' kg' : 'N/A')],
                    ['Birth Length', (child.birthLength ? child.birthLength + ' cm' : 'N/A')],
                    ['Blood Type', child.bloodType || 'N/A']
                ];

                doc.autoTable({
                    startY: startY,
                    head: [['Child Information', '']],
                    body: childInfoBody,
                    theme: 'grid',
                    headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
                    styles: { cellPadding: 5, fontSize: 10 },
                    columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
                    margin: { left: 14, right: 14 }
                });
                startY = doc.lastAutoTable.finalY + 10;

                // Immunization Table
                const childImmunizations = window.mockData.immunizations.filter(i => i.childId === child.id);
                if (childImmunizations.length > 0) {
                    const immBody = childImmunizations.map(v => [
                        v.vaccine,
                        v.dueDate || 'N/A', // Age Due approximation
                        v.dateGiven || '-',
                        v.status
                    ]);

                    doc.autoTable({
                        startY: startY,
                        head: [['Vaccine', 'Due Date', 'Date Given', 'Status']],
                        body: immBody,
                        theme: 'striped',
                        headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
                        styles: { cellPadding: 5, fontSize: 10 },
                        margin: { left: 14, right: 14 }
                    });
                    startY = doc.lastAutoTable.finalY + 10;
                }

                // Growth Measurements (Mocked if not present, based on birth data)
                const growthBody = [
                    [child.birthDate || '-', 'Birth', (child.birthWeight ? child.birthWeight + ' kg' : '-'), (child.birthLength ? child.birthLength + ' cm' : '-'), '-']
                ];
                // Add current if different
                if (child.currentWeight || child.currentHeight) {
                    growthBody.push([
                        new Date().toISOString().split('T')[0],
                        'Current',
                        (child.currentWeight ? child.currentWeight + ' kg' : '-'),
                        (child.currentHeight ? child.currentHeight + ' cm' : '-'),
                        '-'
                    ]);
                }

                doc.autoTable({
                    startY: startY,
                    head: [['Date', 'Age/Stage', 'Weight', 'Height', 'Head Circ']],
                    body: growthBody,
                    theme: 'striped',
                    headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
                    styles: { cellPadding: 5, fontSize: 10 },
                    margin: { left: 14, right: 14 }
                });
                startY = doc.lastAutoTable.finalY + 15;
            });
        }

        // 9. Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text('CCHIS - Confidential Medical Record', 105, 285, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        // 10. Save PDF
        const fileName = `${mother.name.replace(/\s+/g, '_')}_Medical_Record_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        // Success Notification (using existing toast if available, or alert)
        if (typeof showToast === 'function') {
            showToast('Medical record downloaded successfully!', 'success');
        } else {
            // Fallback to alert if toast not available in current scope
            // alert('Medical record downloaded successfully!'); 
            // Commented out to avoid double alerts if UI handles it
        }
    }
};

// Explicitly export to window to ensure availability
window.ExportService = ExportService;
