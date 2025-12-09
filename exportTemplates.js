// Export Templates for Requirements Documents

export const generateSRSTemplate = (data) => {
  const project = data.projectName || '<Project>';
  const author = data.clientName || '<author>';
  const organization = 'ReqMaster AI';
  const createdDate = new Date().toLocaleDateString();

  const fnSummary = data.functional && data.functional.length
    ? data.functional.map((r, i) => `${i + 1}. ${r.title} - ${r.description}`).join('\n')
    : '<Functional requirements to be defined>';

  const nfSummary = data.nonFunctional && data.nonFunctional.length
    ? data.nonFunctional.map((r, i) => `${i + 1}. ${r.title} - ${r.description}`).join('\n')
    : '<Non-functional requirements to be defined>';

  const domainSummary = data.domain && data.domain.length
    ? data.domain.map((r, i) => `${i + 1}. ${r.title} - ${r.description}`).join('\n')
    : '<Domain requirements to be defined>';

  const risksText = data.risks && data.risks.length
    ? data.risks.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : '<Key project risks to be defined>';

  const notesText = data.notes && data.notes.length
    ? data.notes.join('\n')
    : '<Additional notes captured during elicitation>';

  const productScope = `${project} is a software system to address the needs elicited from the client. It provides the following major capabilities:\n${fnSummary}`;

  const productFunctions = fnSummary;

  const overallDescriptionPerspective = domainSummary;

  const systemFeatures = data.functional && data.functional.length
    ? data.functional.map((r, i) => `System Feature ${i + 1}: ${r.title}\nDescription: ${r.description}\nPriority: ${r.priority}`).join('\n\n')
    : '<System features to be detailed>';  

  return `Software Requirements Specification
for
${project}
Version 1.0 approved
Prepared by ${author}
${organization}
${createdDate}
 
Table of Contents
Table of Contents	ii
Revision History	ii
1.	Introduction	1
1.1	Purpose	1
1.2	Document Conventions	1
1.3	Intended Audience and Reading Suggestions	1
1.4	Product Scope	1
1.5	References	1
2.	Overall Description	2
2.1	Product Perspective	2
2.2	Product Functions	2
2.3	User Classes and Characteristics	2
2.4	Operating Environment	2
2.5	Design and Implementation Constraints	2
2.6	User Documentation	2
2.7	Assumptions and Dependencies	3
3.	External Interface Requirements	3
3.1	User Interfaces	3
3.2	Hardware Interfaces	3
3.3	Software Interfaces	3
3.4	Communications Interfaces	3
4.	System Features	4
4.1	System Feature 1	4
4.2	System Feature 2 (and so on)	4
5.	Other Nonfunctional Requirements	4
5.1	Performance Requirements	4
5.2	Safety Requirements	5
5.3	Security Requirements	5
5.4	Software Quality Attributes	5
5.5	Business Rules	5
6.	Other Requirements	5
Appendix A: Glossary	5
Appendix B: Analysis Models	5
Appendix C: To Be Determined List	6
Appendix D: Traceability Matrix……………………………………………………………….6


Revision History
Name	Date	Reason For Changes	Version
${author}	${createdDate}	Initial version	1.0

 
1.	Introduction
1.1	Purpose 
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for ${project}. It is based on the requirements elicited through interactive interviews with the client.
1.2	Document Conventions
This document follows an IEEE-style SRS structure. Headings and numbering follow the standard sections. Plain text paragraphs describe the agreed requirements.
1.3	Intended Audience and Reading Suggestions
This SRS is intended for stakeholders including the client, business analysts, architects, developers, testers, and project managers involved in the delivery of ${project}. Readers seeking a high-level overview should first read Sections 1 and 2. Developers and testers should pay particular attention to Sections 3, 4 and 5.
1.4	Product Scope
${productScope}
1.5	References
${notesText}
2.	Overall Description
2.1	Product Perspective
${overallDescriptionPerspective}
2.2	Product Functions
${productFunctions}
2.3	User Classes and Characteristics
<Specific user roles and their characteristics to be detailed based on project context.>
2.4	Operating Environment
<Describe hosting, operating systems, and external systems once finalized with the client.>
2.5	Design and Implementation Constraints
${risksText}
2.6	User Documentation
<Describe user manuals, online help, and training materials to be produced.>
2.7	Assumptions and Dependencies
${data.timelineSuggestion || '<Project timeline, assumptions, and dependencies to be refined>'}
3.	External Interface Requirements
3.1	User Interfaces
<UI requirements will be derived from detailed UI/UX design for ${project}.>
3.2	Hardware Interfaces
<Hardware interfaces are TBD and depend on the selected deployment environment.>
3.3	Software Interfaces
${domainSummary}
3.4	Communications Interfaces
<Communication protocols and integration patterns will be specified during design.>
4.	System Features
${systemFeatures}
5.	Other Nonfunctional Requirements
5.1	Performance Requirements
${nfSummary}
5.2	Safety Requirements
<Safety-related constraints to be captured if applicable.>
5.3	Security Requirements
<Security-related non-functional requirements (authentication, authorization, data protection) to be refined from the non-functional list above.>
5.4	Software Quality Attributes
<Quality attributes such as reliability, usability, maintainability, and portability will be prioritized based on client needs.>
5.5	Business Rules
<Business rules derived from stakeholder interviews to be itemized here.>
6.	Other Requirements
<Any remaining requirements not covered above will be documented in this section.>
Appendix A: Glossary
<Glossary of project-specific terms to be maintained here.>
Appendix B: Analysis Models
<Diagrams such as use case, class, sequence and ERD generated by the tool may be attached here.>
Appendix C: To Be Determined List
<TBD items from all sections are collected here for tracking.>


Appendix D: Traceability Matrix
<The traceability matrix mapping requirements to design, implementation and test cases will be added here.>
`;
};

export const generateAgileBacklog = (data) => {
  const allRequirements = [
    ...data.functional.map(r => ({ ...r, type: 'Feature' })),
    ...data.nonFunctional.map(r => ({ ...r, type: 'Technical' })),
    ...data.domain.map(r => ({ ...r, type: 'Domain' }))
  ];

  const highPriority = allRequirements.filter(r => r.priority === 'High');
  const mediumPriority = allRequirements.filter(r => r.priority === 'Medium');
  const lowPriority = allRequirements.filter(r => r.priority === 'Low');

  return `AGILE PRODUCT BACKLOG
================================================================================
Project: ${data.projectName}
Client: ${data.clientName}
Generated: ${new Date().toLocaleDateString()}

SPRINT PLANNING SUGGESTION
--------------------------------------------------------------------------------
${data.timelineSuggestion}

HIGH PRIORITY ITEMS (Sprint 1-2)
--------------------------------------------------------------------------------
${highPriority.map((item, i) => `
[${item.type}] #${i + 1}: ${item.title}
Priority: ${item.priority}
Story Points: ${item.priority === 'High' ? '8' : item.priority === 'Medium' ? '5' : '3'}
Description: ${item.description}
`).join('\n')}

MEDIUM PRIORITY ITEMS (Sprint 3-4)
--------------------------------------------------------------------------------
${mediumPriority.map((item, i) => `
[${item.type}] #${highPriority.length + i + 1}: ${item.title}
Priority: ${item.priority}
Story Points: ${item.priority === 'High' ? '8' : item.priority === 'Medium' ? '5' : '3'}
Description: ${item.description}
`).join('\n')}

LOW PRIORITY ITEMS (Future Sprints)
--------------------------------------------------------------------------------
${lowPriority.map((item, i) => `
[${item.type}] #${highPriority.length + mediumPriority.length + i + 1}: ${item.title}
Priority: ${item.priority}
Story Points: ${item.priority === 'High' ? '8' : item.priority === 'Medium' ? '5' : '3'}
Description: ${item.description}
`).join('\n')}

RISKS & DEPENDENCIES
--------------------------------------------------------------------------------
${data.risks.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}
`;
};

export const generateUserStories = (data) => {
  return `USER STORIES DOCUMENT
================================================================================
Project: ${data.projectName}
Client: ${data.clientName}
Generated: ${new Date().toLocaleDateString()}

FUNCTIONAL USER STORIES
--------------------------------------------------------------------------------
${data.functional.map((req, i) => `
Story #${i + 1}: ${req.title}
Priority: ${req.priority}

As a user,
I want to ${req.description.toLowerCase()}
So that I can accomplish my goals effectively.

Acceptance Criteria:
- The system shall ${req.description}
- The feature must be ${req.priority.toLowerCase()} priority
- Testing should verify all edge cases

Story Points: ${req.priority === 'High' ? '8' : req.priority === 'Medium' ? '5' : '3'}
`).join('\n')}

TECHNICAL USER STORIES (Non-Functional)
--------------------------------------------------------------------------------
${data.nonFunctional.map((req, i) => `
Story #${data.functional.length + i + 1}: ${req.title}
Priority: ${req.priority}

As a system,
I need to ${req.description.toLowerCase()}
So that the application meets quality standards.

Acceptance Criteria:
- ${req.description}
- Performance metrics must be defined
- Monitoring and logging should be in place

Story Points: ${req.priority === 'High' ? '5' : req.priority === 'Medium' ? '3' : '2'}
`).join('\n')}

DOMAIN-SPECIFIC STORIES
--------------------------------------------------------------------------------
${data.domain.map((req, i) => `
Story #${data.functional.length + data.nonFunctional.length + i + 1}: ${req.title}
Priority: ${req.priority}

As a stakeholder,
I need ${req.description.toLowerCase()}
So that domain-specific requirements are satisfied.

Acceptance Criteria:
- ${req.description}
- Domain expert validation required
- Compliance with industry standards

Story Points: ${req.priority === 'High' ? '8' : req.priority === 'Medium' ? '5' : '3'}
`).join('\n')}

TIMELINE & RISKS
--------------------------------------------------------------------------------
Estimated Timeline: ${data.timelineSuggestion}

Key Risks:
${data.risks.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}
`;
};

export const templates = {
  srs: {
    name: 'SRS (Software Requirements Specification)',
    generator: generateSRSTemplate,
    description: 'Formal IEEE-style requirements document'
  },
  agile: {
    name: 'Agile Product Backlog',
    generator: generateAgileBacklog,
    description: 'Sprint-ready backlog with story points'
  },
  userStories: {
    name: 'User Stories',
    generator: generateUserStories,
    description: 'Detailed user story format with acceptance criteria'
  }
};
