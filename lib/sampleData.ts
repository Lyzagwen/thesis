import { Thesis } from "./types";

// ---------------------------------------------------------------------------
// SAMPLE / DEMO DATA
// IMPORTANT: Real BSCS thesis data has not been collected yet. These 30 sample
// theses are synthetic records used to demonstrate the full pipeline. They can
// be replaced at any time through the "Upload" feature (CSV or JSON).
// ---------------------------------------------------------------------------

export const SAMPLE_THESES: Thesis[] = [
  {
    id: "T-001",
    title: "A Machine Learning Approach for Predicting Rice Crop Diseases from Leaf Images",
    abstract:
      "This study develops a machine learning model that classifies rice crop diseases using leaf image analysis. The system applies convolutional neural networks to identify common rice diseases including blast, brown spot, and leaf blight. The model achieved high accuracy and provides farmers with an early warning tool for disease detection and crop protection.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-002",
    title: "Student Academic Performance Prediction Using Decision Tree Classification",
    abstract:
      "This research predicts student academic performance using decision tree classifiers trained on demographic and academic records. The system identifies at-risk students early so that advisers can provide timely intervention. Evaluation of the model shows strong predictive accuracy and identifies the most influential factors on student grades and retention.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-003",
    title: "Phishing Website Detection Using Machine Learning Classifiers",
    abstract:
      "The study implements a phishing website detection system that inspects URL features and webpage content using machine learning classifiers. Naive Bayes, random forest, and support vector machine models are compared for detection performance. The system provides real-time warnings to users browsing suspicious websites.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-004",
    title: "Network Intrusion Detection System Based on Deep Learning",
    abstract:
      "This thesis builds a network intrusion detection system using deep learning to analyze traffic patterns and flag malicious activities. Long short-term memory networks are used to model sequential packet data. The system reports high detection rates for common attack types and reduces false alarms in simulated network environments.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-005",
    title: "Automated Irrigation System Using IoT Sensors for Smart Farming",
    abstract:
      "This project designs an automated irrigation system that uses internet of things sensors to monitor soil moisture, temperature, and humidity. The system automatically schedules watering based on sensor readings and weather data. Field trials show significant water savings and improved crop yield for local farmers.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-006",
    title: "Smart Classroom Monitoring System with IoT and Face Recognition",
    abstract:
      "The study presents a smart classroom system that monitors attendance and environmental conditions using IoT devices and facial recognition. The system automatically logs student attendance and adjusts lighting and air conditioning based on occupancy. Testing demonstrates reliable attendance tracking and energy savings.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-007",
    title: "Online Ordering System for Local Food Businesses with Delivery Tracking",
    abstract:
      "This research develops an online ordering platform for small food businesses that includes real-time delivery tracking and payment integration. The system allows customers to browse menus, place orders, and monitor delivery progress. Merchant feedback indicates improved order handling and customer satisfaction.",
    year: "2021",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-008",
    title: "E-Commerce Platform with Recommendation Engine for Handicraft Products",
    abstract:
      "The thesis creates an e-commerce platform for local handicraft products that incorporates a recommendation engine. Collaborative filtering suggests products based on user purchase history and browsing behavior. The platform helps artisans reach a wider market and boosts online sales.",
    year: "2021",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-009",
    title: "Gamified Learning Management System for Computer Science Students",
    abstract:
      "This study develops a gamified learning management system that applies points, badges, and leaderboards to motivate computer science students. Course materials, quizzes, and progress tracking are integrated into an engaging interface. Results show increased student participation and improved quiz performance.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-010",
    title: "Mobile Learning Application for Mathematics with Offline Support",
    abstract:
      "This project builds a mobile learning application for mathematics that works offline and includes interactive exercises and video lessons. The app tracks learner progress and adapts practice questions to skill level. Usability testing with students indicates positive learning outcomes.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-011",
    title: "Blockchain-Based Secure Voting System for Student Government Elections",
    abstract:
      "This research implements a blockchain-based voting system for student government elections that ensures ballot immutability and voter privacy. A distributed ledger records votes while cryptographic hashes prevent tampering. The system was tested during simulated elections and verified audit results.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-012",
    title: "Land Title Verification System Using Blockchain and Smart Contracts",
    abstract:
      "The study proposes a land title verification system that stores ownership records on a blockchain using smart contracts. The system reduces fraudulent claims by providing an immutable audit trail of transactions. Government agency simulations show faster verification processes.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-013",
    title: "Augmented Reality Mobile App for Virtual Science Laboratory Experiments",
    abstract:
      "This thesis develops an augmented reality mobile application that lets students perform virtual science laboratory experiments. Three dimensional models and interactive simulations replace physical equipment for selected experiments. Evaluation shows increased student engagement and safety in laboratory learning.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-014",
    title: "Virtual Museum Tour Application Using AR for Cultural Heritage Preservation",
    abstract:
      "The project creates an augmented reality application that provides virtual tours of cultural heritage sites and museum exhibits. Users point their devices to view historical information and 3D reconstructions. The application was assessed for usability and cultural awareness impact.",
    year: "2021",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-015",
    title: "Hospital Appointment and Patient Records Management System",
    abstract:
      "This research develops a hospital management system that handles appointment scheduling, patient records, and billing. The system digitizes manual processes and provides secure role-based access to medical staff. Deployment testing shows reduced waiting times and fewer record errors.",
    year: "2021",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-016",
    title: "Telemedicine Consultation Platform for Rural Health Centers",
    abstract:
      "The study builds a telemedicine platform that connects rural patients with doctors through video consultation and digital prescriptions. The system includes an online queue and medical history records. Pilot testing indicates improved healthcare access in underserved communities.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-017",
    title: "Sentiment Analysis of Social Media Posts for Local Government Feedback",
    abstract:
      "This thesis applies sentiment analysis to social media posts about local government services. Text preprocessing and classification models categorize feedback as positive, negative, or neutral. The dashboard helps agencies respond quickly to public concerns.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-018",
    title: "Typhoon Risk Mapping and Early Warning System Using Data Analytics",
    abstract:
      "This project develops a typhoon risk mapping system that combines historical weather data and geospatial analytics. The system generates risk scores for municipalities and issues early warnings. Local disaster offices used the system during simulated flooding events.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-019",
    title: "Road Traffic Accident Analysis Dashboard Using Geographic Visualization",
    abstract:
      "The research analyzes road traffic accident records and presents them through an interactive geographic dashboard. Clustering identifies accident hotspots and contributing factors. The tool supports city planning offices in prioritizing road safety improvements.",
    year: "2021",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-020",
    title: "Waste Segregation Monitoring System with Smart Bins and IoT",
    abstract:
      "This study implements smart waste bins equipped with IoT sensors that monitor fill levels and classify waste types. The system notifies collection crews and generates recycling reports. Community deployment reduced improper waste disposal incidents.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-021",
    title: "Fitness Tracker Mobile Application with Personalized Workout Plans",
    abstract:
      "This thesis develops a mobile fitness tracker application that records steps, heart rate, and calories while generating personalized workout plans. The app provides weekly progress reports and goal reminders. User testing shows improved exercise consistency among participants.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-022",
    title: "Campus Navigation System with Indoor Positioning Using Beacons",
    abstract:
      "This project builds a campus navigation application that uses Bluetooth beacons for indoor positioning. The app guides students and visitors to classrooms and offices with turn by turn directions. Accuracy testing shows acceptable positioning errors within hallways.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-023",
    title: "Automated Grading System for Multiple Choice Examinations Using OCR",
    abstract:
      "The research develops an automated grading system that reads answer sheets using optical character recognition. The system scans forms, matches answers, and generates grade reports instantly. Evaluation shows high recognition accuracy and significant time savings for teachers.",
    year: "2021",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-024",
    title: "Course Recommendation System Using Collaborative Filtering",
    abstract:
      "This study designs a course recommendation system that suggests electives to students based on their interests and past grades. Collaborative filtering algorithms and clustering group similar learners. Advising sessions using the system reported better course fit.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-025",
    title: "Chatbot Assistant for University Admission Inquiries Using NLP",
    abstract:
      "This thesis implements a natural language processing chatbot that answers common university admission questions. The bot uses intent classification and a curated knowledge base to handle queries about requirements and schedules. Testing indicates fast and accurate responses.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-026",
    title: "RFID-Based Library Book Tracking and Borrowing System",
    abstract:
      "The project develops a library management system that uses radio frequency identification tags to track books and automate borrowing. The system updates inventory in real time and alerts staff about misplaced items. The pilot reduced book checkout and return processing time.",
    year: "2021",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-027",
    title: "Deep Learning Model for Detecting Skin Lesion Types from Dermatological Images",
    abstract:
      "This research applies deep learning to classify skin lesion images for early detection of skin conditions. Transfer learning with pretrained convolutional networks is used to achieve high classification accuracy. The model is packaged as an assistive diagnostic tool for clinics.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-028",
    title: "Disaster Response Coordination Platform with Real-Time Volunteer Matching",
    abstract:
      "This study develops a disaster response platform that matches volunteers with relief operations in real time. The system considers location, skills, and availability when assigning tasks. Simulations show improved response times during emergency situations.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-029",
    title: "Energy Consumption Monitoring System with Smart Meters and Dashboards",
    abstract:
      "This thesis creates an energy monitoring system that collects consumption data from smart meters and visualizes usage through dashboards. Anomaly detection flags unusual consumption patterns. Facility managers used the system to reduce electricity waste.",
    year: "2023",
    author: "Sample Record",
    source: "sample",
  },
  {
    id: "T-030",
    title: "Web-Based Alumni Portal with Job Posting and Mentorship Matching",
    abstract:
      "This project builds an alumni portal that connects graduates with job postings and mentorship opportunities. The platform includes a searchable alumni directory and event management features. Feedback from alumni associations highlights easier networking.",
    year: "2022",
    author: "Sample Record",
    source: "sample",
  },
];
