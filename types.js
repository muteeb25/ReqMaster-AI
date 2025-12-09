/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {'user' | 'model'} role
 * @property {string} text
 * @property {string} timestamp - ISO string for serialization
 */

/**
 * @typedef {Object} RequirementItem
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'High' | 'Medium' | 'Low'} priority
 */

/**
 * @typedef {Object} StructuredRequirements
 * @property {string} projectName
 * @property {string} clientName
 * @property {RequirementItem[]} functional
 * @property {RequirementItem[]} nonFunctional
 * @property {RequirementItem[]} domain
 * @property {string[]} risks
 * @property {string} timelineSuggestion
 * @property {string[]} notes
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} createdAt
 * @property {StructuredRequirements} requirements
 * @property {Message[]} messages
 */

/**
 * @typedef {'login' | 'signup' | 'chat' | 'summary' | 'dashboard' | 'feedback'} AppView
 */

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} [password]
 * @property {string} [email]
 * @property {Project[]} projects
 */

export {};
