import { createClient } from '@supabase/supabase-js';
import { Workflow } from '../types/workflow';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export class WorkflowService {
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your Supabase credentials in the environment variables.');
    }
  }

  static async saveWorkflow(workflow: Workflow): Promise<Workflow> {
    this.checkSupabaseConnection();
    
    const { data, error } = await supabase!
      .from('workflows')
      .upsert({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        workflow_data: {
          nodes: workflow.nodes,
          edges: workflow.edges,
          metadata: workflow.metadata
        }
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformFromDB(data);
  }

  static async getWorkflow(id: string): Promise<Workflow> {
    this.checkSupabaseConnection();
    
    const { data, error } = await supabase!
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.transformFromDB(data);
  }

  static async getAllWorkflows(): Promise<Workflow[]> {
    this.checkSupabaseConnection();
    
    const { data, error } = await supabase!
      .from('workflows')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(this.transformFromDB);
  }

  static async deleteWorkflow(id: string): Promise<void> {
    this.checkSupabaseConnection();
    
    const { error } = await supabase!
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static isConfigured(): boolean {
    return isSupabaseConfigured;
  }

  private static transformFromDB(dbRecord: any): Workflow {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      nodes: dbRecord.workflow_data.nodes,
      edges: dbRecord.workflow_data.edges,
      metadata: {
        ...dbRecord.workflow_data.metadata,
        created_at: dbRecord.created_at,
        updated_at: dbRecord.updated_at
      }
    };
  }
}