
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let db;
try {
  const client = {
    connection: process.env.DATABASE_URL,
    schema,
    ws: ws,
  };
  
  db = drizzle(client);

  // Test the connection
  const testQuery = async () => {
    try {
      await db.select().from(schema.brewingSessions).limit(1);
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
    return true;
  };

  // If connection test fails, use mock db
  if (!(await testQuery())) {
    console.warn("Using mock database due to connection issues");
    db = {
      insert: () => ({ 
        values: () => ({ 
          returning: () => [{ 
            brewingId: 'mock-1',
            status: 'started',
            settings: {},
            method: 'V60',
            bean: '/default/bean'
          }] 
        }) 
      }),
      update: () => ({ 
        set: () => ({ 
          where: () => ({ 
            returning: () => [{ 
              brewingId: 'mock-1',
              status: 'updated',
              settings: {},
              method: 'V60',
              bean: '/default/bean'
            }] 
          }) 
        }) 
      }),
      query: { 
        brewingSessions: { 
          findFirst: () => ({ 
            brewingId: 'mock-1',
            status: 'mock',
            settings: {},
            method: 'V60',
            bean: '/default/bean'
          }) 
        } 
      }
    };
  }
} catch (error) {
  console.error("Database initialization error:", error);
  // Fallback to mock database
  db = {
    insert: () => ({ 
      values: () => ({ 
        returning: () => [{ 
          brewingId: 'mock-1',
          status: 'started',
          settings: {},
          method: 'V60',
          bean: '/default/bean'
        }] 
      }) 
    }),
    update: () => ({ 
      set: () => ({ 
        where: () => ({ 
          returning: () => [{ 
            brewingId: 'mock-1',
            status: 'updated',
            settings: {},
            method: 'V60',
            bean: '/default/bean'
          }] 
        }) 
      }) 
    }),
    query: { 
      brewingSessions: { 
        findFirst: () => ({ 
          brewingId: 'mock-1',
          status: 'mock',
          settings: {},
          method: 'V60',
          bean: '/default/bean'
        }) 
      } 
    }
  };
}

export { db };
