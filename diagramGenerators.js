// Diagram Generators that return pure PlantUML text

const safeName = (text) => (text || '').replace(/[^a-zA-Z0-9_ ]/g, '').slice(0, 60) || 'Item';

// USE CASE DIAGRAM
export const generateUseCaseDiagram = (data) => {
  const lines = [];
  lines.push('@startuml');
  lines.push('left to right direction');
  lines.push('actor User');

  data.functional.forEach((req, i) => {
    const ucId = `UC${i + 1}`;
    const title = safeName(req.title || `Use Case ${i + 1}`);
    lines.push(`usecase "${title}" as ${ucId}`);
    lines.push(`User --> ${ucId}`);
  });

  lines.push('@enduml');
  return lines.join('\n');
};

// CLASS DIAGRAM (rough draft)
export const generateClassDiagram = (data) => {
  const lines = [];
  lines.push('@startuml');
  lines.push('skinparam classAttributeIconSize 0');

  data.functional.forEach((req, i) => {
    const className = safeName(req.title || `Feature${i + 1}`).replace(/ /g, '');
    lines.push(`class ${className} {`);
    if (req.description) {
      lines.push(`  // ${safeName(req.description)}`);
    }
    lines.push('}');
  });

  lines.push('@enduml');
  return lines.join('\n');
};

// SEQUENCE DIAGRAM
export const generateSequenceDiagram = (data) => {
  const lines = [];
  lines.push('@startuml');
  lines.push('actor User');
  lines.push('participant System');

  data.functional
    .filter((r) => r.priority === 'High')
    .forEach((req, i) => {
      const title = safeName(req.title || `Scenario ${i + 1}`);
      lines.push(`== ${title} ==`);
      lines.push(`User -> System : ${safeName(req.description || 'Perform action')}`);
      lines.push('System --> User : Result');
      lines.push('');
    });

  lines.push('@enduml');
  return lines.join('\n');
};

// FLOW CHART as activity diagram
export const generateFlowChart = (data) => {
  const lines = [];
  lines.push('@startuml');
  lines.push('|User|');
  lines.push('start');

  data.functional.forEach((req, i) => {
    const text = safeName(req.title || `Step ${i + 1}`);
    lines.push(`: ${text};`);
  });

  lines.push('stop');
  lines.push('@enduml');
  return lines.join('\n');
};

// FEATURE TREE
export const generateFeatureTree = (data) => {
  const lines = [];
  const root = safeName(data.projectName || 'System');
  lines.push('@startuml');
  lines.push(`(*) --> "${root}"`);

  data.functional.forEach((req) => {
    const feat = safeName(req.title || 'Feature');
    lines.push(`"${root}" --> "${feat}"`);
  });

  lines.push('@enduml');
  return lines.join('\n');
};

// CONTEXT DIAGRAM
export const generateContextDiagram = (data) => {
  const systemName = safeName(data.projectName || 'System');
  const lines = [];
  lines.push('@startuml');
  lines.push(`node "${systemName}" as System`);
  lines.push('actor User');
  lines.push('User --> System : uses');

  const domainList = data.domain.length ? data.domain : [{ title: 'External System A' }, { title: 'External System B' }];

  domainList.forEach((req, i) => {
    const extName = safeName(req.title || `External ${i + 1}`);
    lines.push(`node "${extName}" as Ext${i + 1}`);
    lines.push(`System --> Ext${i + 1}`);
  });

  lines.push('@enduml');
  return lines.join('\n');
};

// ERD as class diagram
export const generateERDDiagram = (data) => {
  const lines = [];
  lines.push('@startuml');
  lines.push('hide circle');

  const domainList = data.domain.length ? data.domain : [{ title: 'Entity', description: 'attribute1, attribute2' }];

  domainList.forEach((req, i) => {
    const name = safeName(req.title || `Entity${i + 1}`).replace(/ /g, '');
    lines.push(`class ${name} {`);
    (req.description || '')
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((attr) => {
        lines.push(`  ${attr}`);
      });
    lines.push('}');
  });

  lines.push('@enduml');
  return lines.join('\n');
};

export const diagrams = {
  useCase: {
    name: 'Use Case Diagram',
    generator: generateUseCaseDiagram,
    description: 'UML use case diagram based on functional requirements',
  },
  classDiagram: {
    name: 'Class Diagram',
    generator: generateClassDiagram,
    description: 'Rough classes inferred from features',
  },
  sequenceDiagram: {
    name: 'Sequence Diagram',
    generator: generateSequenceDiagram,
    description: 'High-level interaction flows for key scenarios',
  },
  flowChart: {
    name: 'Flow Chart (Activity)',
    generator: generateFlowChart,
    description: 'Activity diagram using main steps',
  },
  featureTree: {
    name: 'Feature Tree',
    generator: generateFeatureTree,
    description: 'Tree of features from requirements',
  },
  contextDiagram: {
    name: 'Context Diagram',
    generator: generateContextDiagram,
    description: 'System and external entities',
  },
  erd: {
    name: 'ERD Diagram',
    generator: generateERDDiagram,
    description: 'Entity draft from domain requirements',
  },
};
