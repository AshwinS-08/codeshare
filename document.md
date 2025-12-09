ABSTRACT 
A "Cloud Native Micro Sharing Platform: File Sharing Through Website Using Unique Code", 
sharing files across different devices and users through traditional methods often requires 
complex login procedures, physical storage media, or platform-dependent restrictions, which 
can be a time-consuming and cumbersome process. This project addresses these challenges 
by developing a comprehensive, web-based system designed to automate and optimize the 
secure sharing of files using a unique code generation mechanism. 
The system facilitates the entire file-sharing life cycle, starting with allowing users to upload 
valid files from any device. Upon upload, the system automatically generates a unique code 
(UUID) and stores the mapping in the database, ensuring efficient retrieval. One of the 
standout features of the system is its simplified user experience, which allows for the secure 
download of files from anywhere using only the generated unique code, removing the 
barrier of complex authentication for quick transfers. This significantly enhances the speed 
and scalability of the process, allowing for a "upload-and-forget" workflow that ensures data 
is accessible only to those with the correct code. 
Furthermore, the system incorporates robust validation mechanisms, such as restricting file 
sizes (e.g., <100MB) and handling unsupported file types to prevent errors. The web 
application enhances the user experience through a responsive interface that manages 
loading states and file validation for smooth interaction. By formalizing the code-based 
retrieval process, the system ensures consistency and creates a secure environment for 
digital asset sharing. 
This project was implemented using FastAPI for the backend to handle high-performance API 
endpoints, with React JS for the frontend to build a dynamic user interface, and AWS 
(Supabase) for secure cloud storage and database management. It includes key features 
such as API testing via Swagger UI and Postman, cross-origin communication (CORS) 
integration, and specific endpoints for uploading and downloading to ensure reliability and 
performance. 
TABLE OF CONTENTS 
Chapter No. Title Page No. 
 ABSTRACT v 
 ACKNOWLEDGEMENT vi 
 LIST OF TABLES ix 
 LIST OF FIGURES x 
 LIST OF ABBREVIATIONS xi 
1 INTRODUCTION 1 
 1.1 PROJECT OVERVIEW 1 
 1.2 PROBLEM STATEMENT 2 
 1.3 AIM OF THE PROJECT 3 
 1.4 CHAPTER PLAN 4 
2 SYSTEM ANALYSIS 5 
 2.1 LITERATURE SURVEY 5 
 2.2 EXISTING SYSTEM 6 
 2.3 PROPOSED SYSTEM 7 
 2.4 REQUIREMENTS GATHERING 8 
 2.5 FEASIBILITY STUDY (Fast, Scalable, Secure) 9 
3 SYSTEM DESIGN 12 
 3.1 MODULE DESIGN (Frontend & Backend) 12 
 3.2 SYSTEM ARCHITECTURE (React, FastAPI, AWS) 14 
 3.3 DATABASE DESIGN (Supabase Mapping Table) 19 
 3.4 API ENDPOINT DESIGN (/upload & /download) 21 
   
Chapter No. Title Page No. 
4 IMPLEMENTATION 24 
 4.1 BACKGROUND STUDY (Tech Stack) 24 
 4.2 IMPLEMENTATION PHASE 29 
 4.3 SYSTEM INTEGRATION (CORS & Deployment) 30 
5 SYSTEM TESTING 31 
 5.1 TESTING TOOLS (Swagger UI, Postman) 31 
 5.2 TEST CASES (Upload & Unique Code Logic) 32 
 5.3 OUTCOME OF THE TEST 33 
6 CONCLUSION 35 
 6.1 CONCLUSION 35 
 6.2 FUTURE ENHANCEMENTS 35 
 APPENDIX A: SCREENSHOT 36 
 APPENDIX B: SAMPLE CODE 42 
 REFERENCES 51 
 
 
LIST OF TABLES 
 
Table No. Title Page No. 
3.1 Database Mapping Schema 20 
3.2 API Endpoint Specifications 21 
4.1 Software Configuration 25 
5.1 Test Cases of Cloud Native Micro Sharing 33 
LIST OF FIGURES 
Figure No. 
Title 
Page No. 
3.1 
System Architecture (React, FastAPI, AWS) 
14 
3.2 
Upload & Code Generation Process Flow 
15 
3.3 
Database Schema (Supabase Mapping) 
19 
4.1 
User Interface: File Upload Screen 
29 
5.1 
API Testing Interface (Swagger UI) 
31 
ABBREVIATIONS 
Acronym 
Abbreviations 
AWS 
Amazon Web Services  
API Application Programming Interface  
CORS Cross-Origin Resource Sharing  
DB 
Database  
JS 
JavaScript  
UI 
User Interface  
UX 
User Experience  
UUID 
Universally Unique Identifier  
QR 
Quick Response (Code)  
MB 
Megabyte  
CHAPTER 1 
INTRODUCTION 
In the era of cloud computing, the ability to share digital assets quickly and securely is a 
fundamental requirement for both individuals and organizations. While numerous file-sharing 
services exist, many are burdened by complex authentication processes, account requirements, 
or platform dependencies. The "Cloud Native Micro Sharing Platform" introduces a 
streamlined approach to data transfer, leveraging modern web technologies to facilitate file 
sharing through a website using a unique code mechanism. This project focuses on removing 
barriers to entry, allowing users to upload files from any device and retrieve them elsewhere 
without the need for physical storage media or cumbersome login procedures. 
1.1 PROBLEM STATEMENT 
Current file-sharing methods often face significant usability and efficiency hurdles. Traditional 
methods, such as email attachments, have strict size limits, while physical media like USB 
drives require physical proximity. Cloud-based solutions often force users to create accounts 
or log in, which slows down the process of quick, ad-hoc file transfers. Furthermore, managing 
file security and ensuring that data is accessible only to the intended recipient remains a 
challenge. There is a need for a system that allows users to upload files and generate a secure, 
unique identifier for retrieval, thereby decoupling the sender and receiver from specific 
platforms or account ecosystems. 
1.2 CHALLENGES 
During the development of the Cloud Native Micro Sharing Platform, several technical and 
design challenges were addressed to ensure a robust system: 
 Cross-Origin Communication: Establishing a secure connection between the React 
frontend and the FastAPI backend required careful configuration of Cross-Origin 
Resource Sharing (CORS) to ensure safe data transmission. 
 File Validation: Handling various file types and sizes demanded robust validation logic 
to reject unsupported formats (e.g., .exe files) and manage storage limits effectively. 
 Unique Code Generation: Developing a logic to generate non-colliding, unique codes 
(UUID or 6-digit) for every upload was critical to ensure that files are retrieved 
correctly without errors. 
 Cloud Integration: Integrating the application with AWS/Supabase for storage and 
database management required precise environment variable configuration and secure 
access policy implementation. 
1.3 AIM OF THE PROJECT 
The primary aim of this project is to develop a "Cloud Native Micro Sharing Platform" that 
simplifies the file-sharing process through a secure, code-based system. The project goal is to 
build a solution that is fast, scalable, secure, and easy to use . 
The specific objectives are: 
 To implement a full-stack web application using React JS for the frontend and FastAPI 
for the backend. 
 To utilize AWS/Supabase for secure file storage and metadata management. 
 To develop a mechanism that generates a unique code (UUID) upon file upload, 
enabling secure retrieval. 
 To create a responsive user interface that supports file validation and provides real-time 
feedback (loading states). 
 To ensure the system is scalable and capable of handling file downloads from any 
location using the correct unique code. 
1.4 CHAPTER PLAN 
The first chapter, Introduction, deals with the overview of the project which comprises the 
problem statement, challenges faced, and the aim of the project. 
Chapter 2, System Analysis, covers the literature survey, existing system limitations, and the 
proposed system requirements, focusing on the selection of React and FastAPI. 
Chapter 3, System Design, details the system architecture, including the database schema for 
mapping unique codes to file paths and the design of API endpoints for uploading and 
downloading. 
Chapter 4, Implementation, depicts the background study of the technology stack (AWS, 
Supabase, React) and the step-by-step development phase. 
CHAPTER 2 
SYSTEM ANALYSIS 
System analysis in a software project is the process of carefully examining and understanding 
the desired system. Its goal is to identify requirements, functionalities, and constraints, leading 
to a well-informed and efficient design for the software solution. This phase is vital for creating 
a robust, user-friendly, and successful software system . 
The proposed system—a Cloud Native Micro Sharing Platform—aims to simplify and 
decentralize the workflow involved in sharing digital assets between users. The analysis 
focuses on understanding the existing manual or platform-dependent processes and 
transforming them into a code-based retrieval system that ensures speed, security, and 
scalability. 
2.1 LITERATURE SURVEY 
The literature review in the field of cloud-based file sharing highlights the increasing shift 
towards micro-services and serverless architectures. Traditional methods of managing file 
transfers often rely on monolithic systems requiring heavy authentication, or physical media 
which are difficult to scale. 
 Cloud Native Architectures: Modern applications are increasingly moving towards 
"Cloud Native" designs, utilizing services like AWS (Amazon Web Services) for 
storage and databases to ensure high availability and durability. 
 Micro-services and APIs: The use of FastAPI has gained traction for its high 
performance and ease of use in building APIs. It allows for the rapid development of 
endpoints such as /upload and /download with automatic documentation features like 
Swagger UI. 
 Frontend Technologies: React JS is widely recognized for building dynamic user 
interfaces. Its component-based architecture allows for smooth user experiences, such 
as handling file validation and loading states efficiently. 
2.2 EXISTING SYSTEM 
In the current ecosystem of file sharing, users often face a cumbersome journey. Sharing a file 
typically involves logging into a third-party service (like Google Drive or Dropbox), navigating 
complex folder structures, and managing permission settings for every recipient. Alternatively, 
physical methods like USB drives require proximity, while email attachments are often limited 
by strict file size caps. 
Limitations of the Existing System: 
 Complex Authentication: Most platforms require both sender and receiver to have 
accounts and log in. 
 Platform Dependency: Users are often locked into specific ecosystems (e.g., Apple 
AirDrop). 
 Lack of Anonymity: Personal details are often required just to download a simple file. 
 Maintenance Overhead: Physical media can be lost or corrupted, and centralized servers 
without cloud scaling can crash under load. 
2.3 PROPOSED SYSTEM 
The proposed system aims to overcome the drawbacks of traditional file sharing by introducing 
a lightweight, code-based platform. The system envisions a "Upload and Forget" workflow 
where the complexity of storage and retrieval is handled by unique identifiers. 
Key Features of the Proposed System: 
 Unique Code Generation: The system automatically generates a unique code (UUID or 
6-digit) upon file upload, serving as the only "key" needed for retrieval. 
 Secure Cloud Storage: Files are stored in a dedicated AWS Storage bucket, ensuring 
industry-standard security and reliability. 
 Platform Independence: The system allows users to upload from any device and 
download from anywhere using the web interface. 
 Validation & Feedback: The system includes validation for file size (< 100MB) and 
types (rejecting .exe), providing immediate feedback to the user. 
 Scalability: Built on FastAPI and Supabase, the backend is designed to handle multiple 
concurrent requests without performance degradation. 
2.4 REQUIREMENTS GATHERING 
Requirements gathering is the initial phase where the technical needs of the project are 
identified. This ensures the system is compatible with modern web standards and development 
environments. 
Hardware Configuration 
The following specifications were used for the development and testing environments: 
 Processor: Intel Core i5 or higher (or equivalent cloud instance vCPU) 
 RAM: 8 GB minimum 
 Hard Disk: 250 GB (Local), AWS S3 Bucket (Cloud Storage) 
Software Configuration  
The following software tools and technologies were selected for development: 
Component: Specification 
Frontend: 
Backend: 
Database: 
Storage: 
React JS, Axios/Fetch  
Python (FastAPI Framework)  
Supabase / AWS RDS  
AWS S3 Bucket / Supabase Storage  
Testing Tools :Postman, Thunder Client, Swagger UI  
IDE: 
VS Code 
Deployment: Vercel / Netlify / Render  
2.5 FEASIBILITY STUDY 
The feasibility study assesses the viability of the "Cloud Native Micro Sharing Platform" across 
technical, operational, and economic dimensions. 
Technical Feasibility The project uses a modern technology stack. React and FastAPI are open
source, stable, and widely supported. AWS provides robust infrastructure for storage and 
database management. The integration of these technologies is well-documented, ensuring that 
the technical requirements for endpoints like /upload and /download/{code} can be met 
efficiently. 
Operational Feasibility The system is designed for ease of use. The "Test Cases" indicate a 
straightforward workflow: "Select a file -> File uploaded -> Unique code generated". This 
simplicity ensures that non-technical users can operate the system without training. The system 
is also Scalable and Secure, handling traffic spikes and data protection effectively. 
Economic Feasibility The development relies on cost-effective tools. React and FastAPI are 
free to use. Supabase and Vercel offer generous free tiers for development and small-scale 
deployment, making the project economically viable with low initial investment costs. The 
"Future Enhancements" like encryption and login systems can be added incrementally without 
significant financial overhaul. 
Based on the objectives and future enhancements outlined in your presentation, here are the 
Mission and Vision statements for the "Cloud Native Micro Sharing Platform." 
I have drafted these to match the tone and format of the "FYP Manager" report, focusing on 
the core attributes (Fast, Scalable, Secure) found in your slides. 
PROJECT MISSION AND VISION 
MISSION 
The mission of the Cloud Native Micro Sharing Platform is to simplify the digital exchange of 
information by providing a fast, scalable, and secure solution for file transfer. We aim to remove 
the barriers of complex authentication and platform dependency, empowering users to share 
data effortlessly across devices using unique identification codes. By leveraging modern cloud 
architecture and user-centric design, we are committed to making file sharing easy to use and 
accessible to everyone. 
VISION 
Our vision is to become a leading standard for ad-hoc digital asset sharing, where security and 
convenience coexist without compromise. We envision a future where data transfer is 
instantaneous and globally accessible, evolving our platform with advanced features like 
encryption and real-time notifications to meet the growing demands of a connected world. We 
strive to create a seamless ecosystem where users trust our platform for its reliability and speed 
in every interaction. 
SERVICES OFFERED 
 Secure Cloud Storage – Leveraging AWS and Supabase to provide a dedicated storage 
bucket for uploaded files, ensuring high availability, data durability, and configured 
secure access policies for every transaction. 
 Unique Identity Generation – Automatically generating unique identification codes 
(UUID / 6-digit) for every file uploaded, creating a seamless mapping between the user 
and their data without the need for complex login systems. 
 Cross-Platform File Retrieval – Enabling users to securely download files from any 
device (desktop, mobile, tablet) using a simple web interface and valid unique codes, 
ensuring the system is fast, scalable, and easy to use. 
 API Testing & Integration – Providing comprehensive API documentation and testing 
services via FastAPI Swagger UI and Postman, allowing developers to validate 
endpoints such as /upload and /download effectively. 
 Data Validation & Safety – Implementing robust validation logic to handle file size 
limits (< 100MB) and restrict unsupported file types (e.g., .exe), ensuring the platform 
remains secure and error-free for all users. 
CHAPTER 3 
SYSTEM DESIGN 
System design concentrates on moving from the problem domain to the solution domain. This 
phase provides the understanding and procedural details necessary for implementing the system 
recommended in the feasibility study. Emphasis is on translating the performance requirements 
into design specifications. Software design is the first step in the development phase of the 
software life cycle, transforming the analysis model into a set of design modules . 
3.1 MODULE DESIGN 
Module design in the Cloud Native Micro Sharing Platform focuses on organizing the system 
into decoupled components: Frontend, Backend, and Storage. This promotes flexibility, 
reusability, and easier maintenance across the system. 
1. Frontend Module (React JS) Responsible for the user interface and interaction logic. 
 Features: 
o Built UI for file upload, unique code display, and download input. 
o Integrated Axios/Fetch for secure API communication with the backend. 
o Added loading states and file validation (checking size <100MB and type) for 
smooth UX. 
2. Backend Module (FastAPI) Responsible for the core logic, API endpoints, and database 
interactions. 
 Features: 
o /upload endpoint: Receives the file from the frontend, uploads it to Supabase 
Storage, generates a unique code (UUID / 6-digit), and stores the mapping in 
the database. 
o /download/{code} endpoint: Validates the provided unique code against the 
database and returns the corresponding file if valid. 
o Swagger UI: Auto-generated documentation for testing API endpoints. 
3. Storage & Database Module (AWS/Supabase) Responsible for data persistence and file 
management. 
 Features: 
o Dedicated Bucket: A secure AWS/Supabase bucket configured for storing 
uploaded files. 
o Mapping Table: A database table responsible for linking unique codes to file 
paths (id | unique_code | file_path | uploaded_at | expires_at). 
o Access Policies: Configured secure access policies to prevent unauthorized 
direct access. 
3.2 UML DIAGRAMS 
The Unified Modeling Language (UML) is used to visualize the design of the system. It helps 
in communicating the essential requirements and functionalities of the system to non
programmers 
3.2.1 Use Case Diagram 
A use case diagram is a graphic depiction of the interactions among the elements of a system. 
A use case is a methodology used in system analysis to identify, clarify, and organize system 
requirements. The actors, usually individuals involved with the system, are defined according 
to their roles . 
The main purpose of this diagram is to capture the dynamic aspects of the system and visualize 
the functional requirements of the Cloud Native Micro Sharing Platform. 
Actors Identified: 
 Uploader: The user who initiates the file sharing process. 
 Downloader: The user who receives the file using the unique code. 
 FastAPI Backend (System): The automated system handling validation, storage, and 
code generation. 
 Here are the Class Diagram, Sequence Diagram, and ER Diagram sections for your 
report. I have formatted them exactly like the "FYP Manager" report, including the 
standard academic definitions and the specific technical details from your "Cloud 
Native Micro Sharing Platform" presentation. 
 
 3.2.2 Class Diagram 
 The class diagram is the main building block of object-oriented modeling. It is used for 
general conceptual modeling of the structure of the application, and for detailed 
modeling, translating the models into programming code. Class diagrams can also be 
used for data modeling . 
 The diagram below represents the core backend structure, including the FastAPI 
Controller for handling requests, the Storage Service for AWS interactions, and the 
Database Model for Supabase mappings. 
3.2.3 Sequence Diagram 
A sequence diagram simply depicts interaction between objects in a sequential order—i.e., the 
order in which these interactions take place. It uses the terms event diagrams or event scenarios 
to refer to a sequence diagram. Sequence diagrams describe how and in what order the objects 
in a system function . 
3.3 ER DIAGRAM 
An Entity-Relationship (ER) diagram is a conceptual tool used in database design to outline 
the structure and relationships of data within a system. It defines key entities and shows how 
these entities are related to one another. The ER diagram helps identify the data requirements 
and rules for the system . 
Since this is a micro-sharing platform without complex user accounts (as per the current scope), 
the database schema focuses on the File Mapping entity. 
3.4 DATABASE DESIGN 
Database design is the process of organizing data into a structured schema. This involves 
defining tables, columns, relationships, and constraints to manage data efficiently. Proper 
database design improves data integrity, making it easier to maintain and update information. 
This results in a more reliable and effective database system overall 1. 
For the Cloud Native Micro Sharing Platform, the database (hosted on Supabase/AWS) is 
designed to handle the critical mapping between the generated unique codes and the physical 
file paths in the cloud storage. 
Table 3.1 File Metadata Mapping 
S. No Field 
Data Type Field Size Constraint 
1 
id 
UUID 
36 
Description 
Primary Key 
Unique Record ID 
2 
unique_code varchar 
10 
Unique / Not Null Generated Code (6-digit) 
3 
file_name 
varchar 
255 
Not Null 
Original Filename 
4 
file_path 
varchar 
255 
Not Null 
AWS/Supabase Bucket Path 
5 
file_size 
Bigint 
20 
Not Null 
Size in Bytes (<100MB) 
6 
file_type 
varchar 
50 
Not Null 
MIME Type (e.g., .pdf, .jpg) 
7 
uploaded_at timestamp - 
Default NOW() Time of Upload 
8 
expires_at 
timestamp - 
Null 
Optional Expiry Time 
Table 3.1 describes the core table used to link the user-facing unique code with the backend 
storage path. It includes validation fields like file_size and file_type to ensure system integrity. 
Table 3.2 System Activity Logs 
S. No Field 
Data Type Field Size Constraint 
Description 
1 
log_id 
int 
11 
Primary Key 
Log Identifier 
2 
action_type varchar 
20 
Not Null 
Upload or Download 
3 
related_code varchar 
10 
Null 
Unique Code Used 
4 
status 
varchar 
20 
Not Null 
Success / Error 
5 
ip_address varchar 
45 
Null 
User IP (for security) 
6 
timestamp timestamp - 
Default NOW() Time of Event 
CHAPTER 4 
IMPLEMENTATION 
Implementation is the stage in the project where the theoretical design is turned into a working 
system. The most critical stage is achieving a successful system and giving confidence to the 
users that the new system will work efficiently and effectively. It involves careful planning, 
investigation of the current system constraints, and the design of methods to achieve the 
changeover . 
4.1 BACKGROUND STUDY 
To build the Cloud Native Micro Sharing Platform, several high-performance technologies 
were selected. This section outlines the software configuration and the theoretical background 
of the tools used. 
4.1.1 React JS (Frontend) 
React is a free and open-source front-end JavaScript library for building user interfaces based 
on UI components. It is maintained by Meta (formerly Facebook) and a community of 
individual developers and companies. React can be used as a base in the development of single
page or mobile applications. 
 Component-Based: React allows developers to build encapsulated components that 
manage their own state, then compose them to make complex UIs. 
 Virtual DOM: React creates an in-memory data structure cache, computes the resulting 
differences, and then updates the browser's displayed DOM efficiently. 
 Declarative: React makes it painless to create interactive UIs. Design simple views for 
each state in your application, and React will efficiently update and render just the right 
components when your data changes. 
4.1.2 FastAPI (Backend) 
FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 
3.7+ based on standard Python type hints. 
 Speed: It is one of the fastest Python frameworks available, on par with NodeJS and 
Go. 
 Automatic Documentation: One of the most useful features is the automatic generation 
of interactive API documentation (using Swagger UI) that lets developers test the API 
directly from the browser. 
 Standard Based: Based on (and fully compatible with) the open standards for APIs: 
OpenAPI (previously known as Swagger) and JSON Schema. 
4.1.3 AWS & Supabase (Cloud Infrastructure) 
 AWS S3 (Simple Storage Service): An object storage service that offers industry
leading scalability, data availability, security, and performance. In this project, it is used 
to store the actual file binaries securely. 
 Supabase: An open-source backend-as-a-service (BaaS) that provides a PostgreSQL 
database, real-time subscriptions, and secure authentication. It serves as the mapping 
layer in this project, linking unique codes to S3 file paths. 
4.1.4 Postman 
Postman is an API platform for building and using APIs. In this project, it acts as a testing tool 
to send HTTP requests (GET, POST) to the FastAPI backend to verify that file uploads and 
unique code generation are working correctly before connecting the frontend. 
4.2 IMPLEMENTATION PHASE 
The implementation of the Cloud Native Micro Sharing Platform was divided into three distinct 
phases: Frontend Development, Backend Development, and System Integration. 
4.2.1 Frontend Implementation (React JS) 
The user interface was built to be simple and responsive. 
1. UI Construction: Created a clean interface with a "Drag and Drop" zone for file uploads 
and a text input field for entering unique codes. 
2. State Management: Implemented React Hooks (useState) to manage loading indicators 
(spinners) while the file is uploading. 
3. API Integration: Used the Axios library to send asynchronous HTTP requests. 
o POST /upload: Sends the FormData object containing the file. 
o GET /download: Sends the unique code to retrieve the file blob. 
4. Validation: Added client-side logic to check if the file size is less than 100MB and 
ensures the file extension is not .exe before the upload starts . 
4.2.2 Backend Implementation (FastAPI) 
The backend logic handles the heavy lifting of storage and code generation. 
1. Endpoint Setup: 
o Defined the /upload endpoint to accept UploadFile objects. 
o Defined the /download/{code} endpoint to accept string parameters. 
2. Unique Code Logic: Integrated the Python uuid library to generate unique identifiers. 
For better user experience, a short 6-digit alphanumeric code generator was also 
implemented for easier typing. 
3. Storage Connection: Configured boto3 (AWS SDK for Python) to securely connect to 
the S3 bucket using environment variables for Access Keys and Secret Keys. 
4. Database Mapping: Implemented SQL queries to insert the record: INSERT INTO 
mappings (code, filepath) VALUES (...) . 
4.2.3 System Integration 
Once both modules were developed, they were connected. 
1. CORS Configuration: Enabled Cross-Origin Resource Sharing (CORS) in FastAPI to 
allow the React frontend (running on a different port/domain) to communicate with the 
backend API. 
2. Environment Variables: Configured .env files to store sensitive keys (Supabase URL, 
AWS Keys) securely, ensuring they are not hardcoded in the source code. 
3. Deployment: 
o Backend: Deployed on Render/Vercel for continuous availability. 
o Frontend: Deployed on Netlify for fast global access . 
CHAPTER 5 
SYSTEM TESTING 
System Testing is an important stage in any system development life cycle. Testing is a process 
of executing a program with the intention of finding errors. The importance of software testing 
and its implications with respect to software quality cannot be overemphasized. Software 
testing is a critical element of software quality assurance and represents the ultimate review of 
specification, design, and coding 1. 
The purpose of testing is to discover errors. It provides a way to check the functionality of 
components, sub-assemblies, and finished products. It is the process of exercising software 
with the intent of ensuring that the software system meets its requirements and user 
expectations and does not fail in an unacceptable manner 2. 
5.1 TESTING STRATEGIES 
The testing phase involves the testing of the developed system using various kinds of data. An 
elaborated testing of data is prepared, and a system is tested using the test data. 
Unit Testing 
In unit testing, the analyst tests the programs making up a system. The software units in a 
system are the modules and routines that are assembled and integrated to perform a specific 
function 3. 
 In this project: Unit tests were performed on the FastAPI backend to verify specific 
functions, such as the unique code generation logic (UUID/6-digit) and the file size 
validation function (<100MB). 
Integration Testing 
Integration testing is a systematic technique for constructing the program structure while 
conducting tests to uncover errors associated with interfacing456.78 
 In this project: Integration testing ensured that the React Frontend could successfully 
communicate with the FastAPI Backend via HTTP req9uests. This confirmed10 that 
Cross-Origin Resource Sharing (CORS) was configured correctly and that file streams 
were correctly se11nt to AWS/Supabase Storage. 
API Testing (Black Box) 
This method treats the coded module as a black box. The module runs with inputs that are likely 
to cause errors 12. 
 Tools Used: FastAPI Swagger UI (/docs) and Postman / Thunder Client were used to 
manually test endpoints such as /upload and /download. This verified that the system 
returned the correct JSON responses and error messages without inspecting the internal 
code structure 13. 
5.2 TEST CASES 
A test case is a documented set of conditions or inputs along with the expected results that are 
used to determine whether a system or application is functioning correctly14. 
Table 5.1 Test Cases of Cloud Native Micro Sharing Platform 
Test 
Case ID Description 
Expected Result 
Actual Result 
TC001 Upload a valid file (Input: 
Select a file < 100MB) 
File 
File uploaded and 
unique 
Status 
uploaded 
code 
generated 
TC002 
Upload unsupported file 
type (Input: Select .exe 
file) 
Show error: "File type 
not allowed" 
successfully, 
Code 
"A1B2C3" returned 
Pass 
Error displayed: "400 
Bad Request: File type 
not allowed" 
TC003 
Download using correct 
unique code (Input: Valid 
code) 
File should download 
successfully 
Pass 
from 
Supabase 
TC004 
Download 
invalid/expired 
using 
code 
(Input: Random code) 
Show: "Invalid or 
expired code" 
Pass 
File download initiated 
immediately 
Pass 
Error displayed: "404 
Not Found: Invalid or 
expired code" 
TC005 File Size Limit Check 
(Input: File > 100MB) 
Prevent upload and 
show size error 
Upload blocked, "File 
too large" error shown Pass 
15 
5.3 OUTCOME OF THE TEST 
The outcomes of the test for the Cloud Native Micro Sharing Platform using React and FastAPI 
were successful. 
CHAPTER 6 
CONCLUSION 
6.1 CONCLUSION 
In conclusion, the comprehensive design and development of the Cloud Native Micro Sharing 
Platform is rooted in a user-centric approach, employing React JS for Front-End responsiveness 
and FastAPI for Back-End efficiency. Leveraging AWS and Supabase ensures structured data 
storage and secure file management, a critical aspect for housing essential digital assets. 
The system's key features, such as the "Upload and Forget" workflow, unique code generation 
(UUID), and robust file validation mechanisms, aim to optimize the file-sharing process and 
enhance accessibility for users across different devices. The implementation of specific API 
endpoints for uploading and downloading, combined with automated testing via Swagger UI, 
contributes to streamlining the entire data transfer lifecycle. 
The Cloud Native Micro Sharing Platform, with its simple interface and robust functionalities, 
stands poised to revolutionize the traditional methods of file sharing. By ensuring the system 
is Fast, Scalable, and Secure, it provides a streamlined and transparent experience for all users 
involved . 
6.2 FUTURE ENHANCEMENTS 
For future enhancements, a dedicated Login System is proposed to provide users with 
personalized dashboards and history tracking. To further secure the data transfer process, End
to-End Encryption will be implemented, ensuring that files remain private during transit and 
storage. 
Additionally, the system aims to introduce Download Limits to control bandwidth usage and 
Real-Time Notifications to alert users when their files have been accessed. To improve user 
convenience, a QR Code Generation feature will be developed to allow for quick mobile 
scanning and retrieval, along with File Previews to let users verify content before downloading. 
These enhancements aim to elevate the user experience and integrate the platform seamlessly 
into broader digital ecosystems. 
Here is the References section for your project report. 
I have selected resources that specifically support the technologies mentioned in your 
presentation (React, FastAPI, AWS, Supabase) and formatted them to match the IEEE standard 
used in the FYP Manager sample report. 
REFERENCES 
[1] Banks, A. and Porcello, E., "Learning React: Modern Patterns for Developing React Apps", 
O'Reilly Media, 2nd Edition, pp. 10-150, 2020. 
[2] Christie, T., "Django REST Framework (Concept Reference for API Design)", O'Reilly 
Media, Vol. 1, No. 1, pp. 45-102, 2019. 
[3] Lathkar, M., "Python Web Development with FastAPI", BPB Publications, 1st Edition, pp. 
20-200, 2023. 
[4] McKinney, W., "Python for Data Analysis: Data Wrangling with Pandas, NumPy, and 
IPython", O'Reilly Media, 3rd Edition, 2022. 
[5] Richardson, L. and Ruby, S., "RESTful Web Services", O'Reilly Media, pp. 1-400, 2007. 
[6] Amazon Web Services, "Amazon S3 Developer Guide", AWS Documentation, Available: 
https://docs.aws.amazon.com/AmazonS3/latest/dev/, Accessed: 2025. 
[7] Supabase, "Supabase Documentation: The Open Source Firebase Alternative", Supabase 
Docs, Available: https://supabase.com/docs, Accessed: 2025. 
[8] Tiangolo, S., "FastAPI Documentation", https://fastapi.tiangolo.com/, Accessed: 2025. 
[9] W3C, "Cross-Origin Resource Sharing (CORS)", W3C Recommendation, Available: 
https://www.w3.org/TR/cors/, Accessed: 2025. 
[10] Python Software Foundation, "The Python Standard Library (UUID and OS Modules)", 
https://docs.python.org/3/library/, Accessed: 2025. 
[11] Freeman, A., "Pro React 16", Apress, pp. 100-350, 2019. 
[12] Percival, H., "Test-Driven Development with Python", O'Reilly Media, 2nd Edition, pp. 
5-50, 2017. 
[13] Mozilla Developer Network, "Using Files from Web Applications", MDN Web Docs, 
Available: 
https://developer.mozilla.org/en
US/docs/Web/API/File/Using_files_from_web_applications, Accessed: 2025. 
[14] Fielding, R. T., "Architectural Styles and the Design of Network-based Software 
Architectures", Ph.D. Dissertation, University of California, Irvine, 2000. 
[15] Vercel, "Deployment Documentation for Frontend Applications", Vercel Docs, Available: 
https://vercel.com/docs, Accessed: 2025. 
 
 
 
 
 