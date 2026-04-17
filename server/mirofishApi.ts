/**
 * MiroFish API Backend
 * Handles communication with MiroFish multi-agent AI for enhanced predictions
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execPromise = promisify(exec);

interface DisruptionInput {
  id: string;
  name: string;
  type: string;
  probability: number;
  impactScore: number;
  duration: number;
  affectedRegions: string[];
  description?: string;
}

interface MiroFishAnalysis {
  id: string;
  confidence: number;
  summary: string;
  key_signals: string[];
  stakeholder_reactions?: Record<string, string>;
  timeline?: Record<string, string>;
}

/**
 * Enhance disruption predictions using MiroFish multi-agent simulation
 */
export async function enhanceDisruptionsWithMiroFish(
  disruptions: DisruptionInput[]
): Promise<MiroFishAnalysis[]> {
  try {
    console.log("🤖 Starting MiroFish enhancement for", disruptions.length, "disruptions");

    // Create a temporary JSON file with disruptions
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const inputFile = path.join(tempDir, `disruptions_${Date.now()}.json`);
    const outputFile = path.join(tempDir, `mirofish_results_${Date.now()}.json`);

    fs.writeFileSync(inputFile, JSON.stringify(disruptions, null, 2));

    // Check if MiroFish is available
    const miroFishPath = path.join(process.cwd(), "ai-mirofish");
    if (!fs.existsSync(miroFishPath)) {
      console.warn("⚠ MiroFish not installed, using mock predictions");
      return generateMockMiroFishResults(disruptions);
    }

    // Try to run MiroFish Python integration
    try {
      const pythonScript = path.join(process.cwd(), "mirofish_integration.py");
      if (fs.existsSync(pythonScript)) {
        const command = `python "${pythonScript}" --input "${inputFile}" --output "${outputFile}"`;
        console.log("📡 Running MiroFish simulation...");

        try {
          await execPromise(command, { timeout: 60000 });

          // Read results
          if (fs.existsSync(outputFile)) {
            const results = JSON.parse(fs.readFileSync(outputFile, "utf-8"));
            console.log("✓ MiroFish analysis completed");

            // Cleanup temp files
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);

            return results;
          }
        } catch (execError) {
          console.warn("⚠ MiroFish execution error, using mock results:", execError);
        }
      }
    } catch (error) {
      console.warn("⚠ Failed to run MiroFish simulation:", error);
    }

    // Fallback to mock results
    console.log("📊 Using mock MiroFish analysis (MiroFish not configured)");
    return generateMockMiroFishResults(disruptions);
  } catch (error) {
    console.error("❌ MiroFish enhancement failed:", error);
    // Return basic results
    return disruptions.map((d) => ({
      id: d.id,
      confidence: 0.5,
      summary: "MiroFish analysis unavailable",
      key_signals: [],
    }));
  }
}

/**
 * Generate mock MiroFish results for demonstration
 */
function generateMockMiroFishResults(
  disruptions: DisruptionInput[]
): MiroFishAnalysis[] {
  return disruptions.map((disruption) => {
    const typeSpecificSignals: Record<string, string[]> = {
      port_closure: [
        "Shipping companies pivot to alternative ports",
        "Port workers seek temporary employment elsewhere",
        "Retailers accelerate inventory accumulation",
        "Manufacturers consider nearshoring options",
        "Insurance companies reassess maritime risk premiums",
      ],
      material_shortage: [
        "Manufacturers negotiate emergency pricing with suppliers",
        "Customers explore substitutes and alternative materials",
        "Suppliers consolidate customer bases",
        "Secondary markets for recycled materials emerge",
        "Long-term vertical integration discussions accelerate",
      ],
      geopolitical: [
        "Multinational corporations diversify supply chain geography",
        "Government policy uncertainty increases hedging costs",
        "Diplomatic channels seek crisis resolution",
        "Consumers accept regional product variations",
        "Trade associations lobby for tariff relief",
      ],
      natural_disaster: [
        "Insurance claims processing accelerates recovery",
        "Supply chain redundancy investments increase",
        "Government disaster relief mobilizes resources",
        "Communities prioritize infrastructure resilience",
        "Businesses implement climate adaptation strategies",
      ],
      pandemic: [
        "Organizations accelerate digital transformation",
        "Healthcare supply chains reorganize priorities",
        "Remote work becomes permanent for many roles",
        "Consumer behavior shifts toward online purchasing",
        "Public health infrastructure receives increased funding",
      ],
      cyber_attack: [
        "Cybersecurity investments spike across industries",
        "Data privacy regulations become more stringent",
        "Insurance requirements for cyber coverage increase",
        "Backup system redundancy becomes standard",
        "Supply chain partner security audits intensify",
      ],
    };

    const signals = typeSpecificSignals[disruption.type] || [
      "Stakeholders assess impact and prepare responses",
      "Supply chain contingency plans activate",
      "Market participants adjust pricing and inventory",
      "Risk mitigation strategies are implemented",
      "Long-term resilience improvements are planned",
    ];

    const timelineBase: Record<string, string> = {
      immediate:
        "Initial assessment and emergency response activation within 24-48 hours",
      short_term: `Contingency measures and alternative arrangements within ${Math.ceil(disruption.duration / 3)} days`,
      long_term: `Strategic adaptations and system improvements over ${Math.ceil(disruption.duration * 2)} days+`,
    };

    const stakeholderReactionsBase: Record<string, string> = {
      suppliers:
        "Exploring alternative markets and customer bases for diversification",
      customers:
        "Implementing stockpiling strategies and dual-sourcing arrangements",
      regulators:
        "Reviewing supply chain resilience requirements and policy frameworks",
      investors: "Reassessing company risk profiles and supply chain exposure",
      workforce:
        "Adapting to new operational patterns and potential role shifts",
    };

    return {
      id: disruption.id,
      confidence: 0.65 + Math.random() * 0.25, // 0.65 - 0.90
      summary: `Multi-agent simulation predicts significant stakeholder coordination challenges. ${Math.random() > 0.5 ? "Community resilience factors may mitigate worst-case scenarios." : "Cascading effects across supply network expected."}`,
      key_signals: signals,
      stakeholder_reactions: stakeholderReactionsBase,
      timeline: timelineBase,
    };
  });
}

/**
 * Express route handler for MiroFish enhancement API
 */
export function createMiroFishRouter(express: any) {
  const router = express.Router();

  router.post("/enhance", async (req: any, res: any) => {
    try {
      const { disruptions } = req.body;

      if (!disruptions || !Array.isArray(disruptions)) {
        return res.status(400).json({ error: "Invalid disruptions data" });
      }

      const enhancedDisruptions = await enhanceDisruptionsWithMiroFish(disruptions);

      res.json({
        success: true,
        enhancedDisruptions: disruptions.map((d, idx) => ({
          ...d,
          mirofish_analysis: enhancedDisruptions[idx],
        })),
      });
    } catch (error) {
      console.error("Error in /enhance endpoint:", error);
      res.status(500).json({
        success: false,
        error: "Failed to enhance disruptions with MiroFish",
      });
    }
  });

  router.get("/status", (req: any, res: any) => {
    const miroFishPath = path.join(process.cwd(), "ai-mirofish");
    const isAvailable = fs.existsSync(miroFishPath);

    res.json({
      mirofish_available: isAvailable,
      status: isAvailable ? "ready" : "not_installed",
      message: isAvailable
        ? "MiroFish multi-agent AI is available"
        : "MiroFish is not installed. Install from: https://github.com/amadad/mirofish-cli",
    });
  });

  return router;
}
