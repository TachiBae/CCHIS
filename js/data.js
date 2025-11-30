/**
 * CCHIS Mock Data
 * Used to simulate backend data for the application
 */

const currentUser = {
    username: "admin",
    name: "Dr. Maria Clara",
    role: "Midwife"
};

const mothers = [
    {
        id: "M001",
        name: "Maria Santos",
        dob: "1995-05-15",
        age: 28,
        civilStatus: "Married",
        occupation: "Teacher",
        contact: "0917-123-4567",
        email: "maria.santos@email.com",
        address: "Brgy. San Jose, Pasig City",
        emergencyContact: "Juan Santos (Husband) - 0917-111-2222",
        education: "College Graduate",
        gravida: 2,
        para: 1,
        edd: "2023-12-15",
        deliveryDate: "2023-12-10",
        status: "Normal",
        riskFactors: [],
        childId: "C001"
    },
    {
        id: "M002",
        name: "Ana Reyes",
        dob: "1989-08-20",
        age: 34,
        civilStatus: "Single",
        occupation: "Call Center Agent",
        contact: "0918-987-6543",
        email: "ana.reyes@email.com",
        address: "Brgy. Kapitolyo, Pasig City",
        emergencyContact: "Jose Reyes (Father) - 0918-333-4444",
        education: "College Undergraduate",
        gravida: 4,
        para: 3,
        edd: "2023-11-20",
        deliveryDate: "2023-11-18",
        status: "High Risk",
        riskFactors: ["History of Preeclampsia", "Postpartum Depression Risk"],
        childId: "C002"
    },
    {
        id: "M003",
        name: "Liza Soberano",
        dob: "1999-01-04",
        age: 24,
        civilStatus: "Married",
        occupation: "Actress",
        contact: "0920-555-6666",
        email: "liza@email.com",
        address: "Brgy. Pineda, Pasig City",
        emergencyContact: "Enrique Gil (Husband) - 0920-777-8888",
        education: "College Graduate",
        gravida: 1,
        para: 0,
        edd: "2024-01-05",
        deliveryDate: null,
        status: "Normal",
        riskFactors: [],
        childId: null
    },
    {
        id: "M004",
        name: "Sarah Geronimo",
        dob: "1993-07-25",
        age: 30,
        civilStatus: "Married",
        occupation: "Singer",
        contact: "0919-123-9876",
        email: "sarah@email.com",
        address: "Brgy. Oranbo, Pasig City",
        emergencyContact: "Matteo Guidicelli (Husband) - 0919-444-5555",
        education: "High School Graduate",
        gravida: 2,
        para: 2,
        edd: "2023-10-30",
        deliveryDate: "2023-10-25",
        status: "Critical",
        riskFactors: ["Anemia", "Hypertension"],
        childId: "C004"
    },
    {
        id: "M005",
        name: "Regine Velasquez",
        dob: "1983-04-22",
        age: 40,
        civilStatus: "Married",
        occupation: "Housewife",
        contact: "0917-888-9999",
        email: "regine@email.com",
        address: "Brgy. Ugong, Pasig City",
        emergencyContact: "Ogie Alcasid (Husband) - 0917-000-1111",
        education: "College Graduate",
        gravida: 5,
        para: 4,
        edd: "2023-11-15",
        deliveryDate: "2023-11-12",
        status: "Normal",
        riskFactors: ["Advanced Maternal Age"],
        childId: "C005"
    },
    {
        id: "M006",
        name: "Ella Martinez",
        dob: "1995-05-15",
        age: 28,
        civilStatus: "Married",
        occupation: "Teacher",
        contact: "0917-123-4567",
        email: "ella.martinez@email.com",
        address: "Brgy. San Jose, Pasig City",
        emergencyContact: "Juan Martinez (Husband) - 0917-111-2222",
        education: "College Graduate",
        gravida: 1,
        para: 1,
        edd: "2023-12-12",
        deliveryDate: "2023-12-12",
        status: "Normal",
        riskFactors: [],
        childId: "C006"
    }
];

const children = [
    {
        id: "C001",
        motherId: "M001",
        name: "Juan Santos",
        sex: "Male",
        birthDate: "2023-12-10",
        birthPlace: "Pasig City General Hospital",
        birthWeight: 3.2, // kg
        birthLength: 49, // cm
        bloodType: "O+",
        status: "Normal"
    },
    {
        id: "C002",
        motherId: "M002",
        name: "Baby Cruz",
        sex: "Female",
        birthDate: "2023-11-18",
        birthPlace: "Rizal Medical Center",
        birthWeight: 2.8,
        birthLength: 47,
        bloodType: "A+",
        status: "At Risk"
    },
    {
        id: "C004",
        motherId: "M004",
        name: "Matteo Guidicelli Jr.",
        sex: "Male",
        birthDate: "2023-10-25",
        birthPlace: "St. Luke's Medical Center",
        birthWeight: 3.5,
        birthLength: 51,
        bloodType: "B+",
        status: "Normal"
    },
    {
        id: "C005",
        motherId: "M005",
        name: "Nate Alcasid",
        sex: "Male",
        birthDate: "2023-11-12",
        birthPlace: "Medical City",
        birthWeight: 3.0,
        birthLength: 50,
        bloodType: "AB+",
        status: "Normal"
    },
    {
        id: "C006",
        motherId: "M006",
        name: "Baby Martinez",
        sex: "Female",
        birthDate: "2023-12-12",
        birthPlace: "Pasig City General Hospital",
        birthWeight: 3.1,
        birthLength: 49,
        bloodType: "O+",
        status: "Normal"
    }
];

const postpartumVisits = [
    {
        id: "V001",
        motherId: "M001",
        type: "48-hour",
        date: "2023-12-12",
        status: "Completed",
        notes: "Normal recovery"
    },
    {
        id: "V002",
        motherId: "M001",
        type: "7-day",
        date: "2023-12-17",
        status: "Overdue",
        notes: "Patient did not arrive"
    },
    {
        id: "V003",
        motherId: "M002",
        type: "48-hour",
        date: "2023-11-20",
        status: "Completed",
        notes: "Slight fever noted"
    },
    {
        id: "V004",
        motherId: "M002",
        type: "7-day",
        date: "2023-11-25",
        status: "Completed",
        notes: "Recovering well"
    },
    {
        id: "V005",
        motherId: "M002",
        type: "6-week",
        date: "2023-12-30",
        status: "Upcoming",
        notes: ""
    }
];

const immunizations = [
    {
        childId: "C001",
        vaccine: "BCG",
        dateGiven: "2023-12-10",
        status: "Completed"
    },
    {
        childId: "C001",
        vaccine: "Hepatitis B",
        dateGiven: "2023-12-10",
        status: "Completed"
    },
    {
        childId: "C002",
        vaccine: "BCG",
        dateGiven: "2023-11-18",
        status: "Completed"
    },
    {
        childId: "C002",
        vaccine: "Hepatitis B",
        dateGiven: "2023-11-18",
        status: "Completed"
    },
    {
        childId: "C002",
        vaccine: "DPT 1",
        dateGiven: null,
        dueDate: "2023-12-30",
        status: "Upcoming"
    }
];

// Dashboard Statistics
const stats = {
    activePairs: 42,
    overdueFollowups: 8,
    upcomingImmunizations: 15,
    highRiskCases: 3,
    statusOverview: {
        normal: 35,
        atRisk: 4,
        critical: 3
    }
};

const attentionItems = [
    { text: "Maria Santos - 7-day postpartum visit overdue", type: "alert" },
    { text: "Baby Cruz - DPT vaccine scheduled today", type: "warning" },
    { text: "Ana Reyes - High-risk mental health screening", type: "critical" }
];

const appointmentRequests = [
    {
        id: "R001",
        motherId: "M002",
        motherName: "Ana Reyes",
        date: "2023-12-20",
        time: "10:00",
        reason: "Postpartum Checkup",
        status: "Pending",
        submitted: "2023-12-18"
    }
];

// Export data globally
window.mockData = {
    currentUser,
    mothers,
    children,
    postpartumVisits,
    immunizations,
    stats,
    attentionItems,
    appointmentRequests
};
