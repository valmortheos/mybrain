import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

// Cognitive Domains
export enum CognitiveGroup {
  MEMORY = 'memory',
  LOGIC = 'logic',
  EMOTION = 'emotion',
  VISUAL = 'visual',
  CORE = 'core'
}

// Graph Data Structures
export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  group: CognitiveGroup;
  val: number; // radius/importance
  description?: string;
  // Explicitly add d3 simulation properties to ensure TS recognition
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number; // connection strength
}

export interface CognitiveGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// User Profile Data Structure (New Feature)
export interface UserProfile {
  name: string | null;
  age: number | null;
  gender: string | null;
  mbti: string | null; // e.g. "INTJ"
  careerAmbitions: string[]; // e.g. ["Software Engineer", "Writer"]
  hobbies: string[];
  interests: string[];
  likes: string[];
  dislikes: string[];
  personalityTraits: string[]; // e.g., "Introvert", "Optimis"
}

// Chat System
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface CognitiveMetrics {
  analytical: number;
  creative: number;
  emotional: number;
  memory: number;
}

// AI Analysis Response Structure
export interface CognitiveAnalysisResult {
  reply: string; // The conversational response
  graphUpdates?: {
    newNodes: Array<{ id: string; label: string; group: CognitiveGroup; val: number; description: string }>;
    newLinks: Array<{ source: string; target: string; value: number }>;
  };
  metrics?: CognitiveMetrics;
  // New field for profile updates
  profileUpdate?: Partial<UserProfile>;
}

// Backup Data Structure
export interface AppBackupData {
  version: string;
  timestamp: number;
  graphData: CognitiveGraphData;
  messages: Message[];
  metrics: CognitiveMetrics;
  userProfile: UserProfile;
}