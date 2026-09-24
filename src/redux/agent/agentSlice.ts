import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Inteface follow similar naming conventions to those used for classes
export interface Agent {
  CONVERSATION_ID: string;
  NT_LOGIN: string;
  NAME: string;
  PERMISSIONS: [];
}
interface AgentState {
  agents: { [key: string]: Agent };
}
const initialState: AgentState = {
  agents: {}
};

const Agentslice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    addAgents: (
      state,
      action: PayloadAction<{ key: string; agent: Agent }>
    ) => {
      const { key, agent } = action.payload;
      state.agents[key] = agent;
    },
    updateAgents: (
      state,
      action: PayloadAction<{ key: string; updatedAgent: Agent }>
    ) => {
      const { key, updatedAgent } = action.payload;
      if (state.agents[key]) {
        state.agents[key] = { ...state.agents[key], ...updatedAgent };
      }
    },
    // Action to delete data
    deleteAgents: (state, action: PayloadAction<string>) => {
      const keyTobeDelted = action.payload;
      delete state.agents[keyTobeDelted];
    },
    getAgent: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      const agent = state.agents[key];
      if (agent) {
        console.log(agent);
      } else {
        console.log(`Agent with key ${key} not found.`);
      }
    }
  }
});

export const { addAgents, updateAgents, deleteAgents, getAgent } =
  Agentslice.actions;
export default Agentslice.reducer;
