# Question Generation System

## Overview

The Question Generation System is a modern, intelligent approach to gathering user input for project configuration. It replaces the old complex dynamic question generator with a simpler, more effective system that follows clean architecture principles.

## Architecture Principles

### 🏗️ Core Principles

1. **Agents Handle Questions, Plugins Provide Data**
   - Plugins provide parameter schemas and configuration data
   - Agents use that data to generate and ask intelligent questions
   - Plugins never generate questions directly

2. **Progressive Disclosure**
   - Only ask what's needed based on context
   - Conditional questions based on previous answers
   - Expertise-based question complexity

3. **Intelligent Recommendations**
   - Context-aware technology suggestions
   - Project-type specific recommendations
   - Confidence-based alternatives

4. **Flexible User Experience**
   - Guided approach (recommendations with ability to change)
   - Selective approach (full user control)
   - Expert mode for advanced users

## System Components

### 📁 File Structure

```
src/
├── types/
│   └── questions.ts                    # Question types and interfaces
├── core/
│   └── questions/
│       ├── index.ts                    # Main exports
│       ├── path-selector.ts            # Guided vs Selective choice
│       ├── question-strategy.ts        # Base strategy class
│       ├── progressive-flow.ts         # Flow orchestration
│       ├── recommendation-engine.ts    # Smart recommendations
│       └── strategies/
│           ├── ecommerce-strategy.ts   # E-commerce specific
│           ├── blog-strategy.ts        # Blog specific
│           └── dashboard-strategy.ts   # Dashboard specific
```

### 🔧 Core Components

#### 1. Question Types (`src/types/questions.ts`)

Defines the simplified question system types:

```typescript
export interface Question {
  id: string;
  type: 'confirm' | 'input' | 'select' | 'multiselect' | 'path';
  name: string;
  message: string;
  description?: string;
  choices?: QuestionChoice[];
  default?: any;
  when?: (answers: Record<string, any>) => boolean;
  validate?: (input: any) => boolean | string;
}

export interface ProjectContext {
  type: ProjectType;
  expertise: UserExpertise;
  features: string[];
  requirements: string[];
}

export type ProjectType = 'ecommerce' | 'blog' | 'dashboard' | 'api' | 'fullstack' | 'custom';
export type UserExpertise = 'beginner' | 'intermediate' | 'expert';
export type ApproachType = 'guided' | 'selective';
```

#### 2. Path Selector (`src/core/questions/path-selector.ts`)

Handles the initial approach selection:

```typescript
export class PathSelector {
  async selectPath(): Promise<ApproachType> {
    // Presents guided vs selective choice
  }
}
```

**Guided Approach:**
- Shows intelligent recommendations
- Allows changing recommendations one category at a time
- Best for most users

**Selective Approach:**
- Full control over all choices
- No recommendations
- Best for expert users

#### 3. Base Question Strategy (`src/core/questions/question-strategy.ts`)

Abstract base class for project-specific strategies:

```typescript
export abstract class BaseQuestionStrategy implements QuestionStrategy {
  abstract name: string;
  abstract projectType: ProjectType;

  analyzeContext(userInput: string): ProjectContext {
    // Analyzes user input to determine project context
  }

  generateQuestions(context: ProjectContext): Question[] {
    // Generates questions based on project context
  }

  getRecommendations(context: ProjectContext): Recommendation[] {
    // Provides intelligent recommendations
  }

  protected abstract getProjectQuestions(context: ProjectContext): Question[];
  protected abstract getFeatureQuestions(context: ProjectContext): Question[];
  protected abstract getDatabaseRecommendation(context: ProjectContext): Recommendation;
  protected abstract getAuthRecommendation(context: ProjectContext): Recommendation;
  protected abstract getUIRecommendation(context: ProjectContext): Recommendation;
  protected abstract getPaymentRecommendation(context: ProjectContext): Recommendation;
  protected abstract getEmailRecommendation(context: ProjectContext): Recommendation;
}
```

#### 4. Progressive Flow (`src/core/questions/progressive-flow.ts`)

Orchestrates the entire question flow:

```typescript
export class ProgressiveFlow {
  async execute(userInput: string, strategy: BaseQuestionStrategy): Promise<FlowResult> {
    // 1. Analyze project context
    // 2. Get recommendations
    // 3. Present recommendations
    // 4. Ask questions
    // 5. Build configuration
  }
}
```

#### 5. Recommendation Engine (`src/core/questions/recommendation-engine.ts`)

Provides intelligent technology recommendations:

```typescript
export class RecommendationEngine {
  getRecommendations(context: ProjectContext): RecommendationSet {
    // Returns recommendations for all categories
  }

  getAlternatives(category: string): Recommendation[] {
    // Returns alternative options for a category
  }
}
```

### 📋 Project-Specific Strategies

#### E-commerce Strategy (`src/core/questions/strategies/ecommerce-strategy.ts`)

**Questions:**
- Business type (B2B, B2C, marketplace)
- Payment methods (Stripe, PayPal, etc.)
- Inventory management
- Order processing
- Shipping options

**Recommendations:**
- Database: Drizzle + Neon (TypeScript-first, excellent performance)
- Auth: Better Auth (modern, secure)
- UI: Shadcn UI (beautiful, accessible)
- Payments: Stripe (industry standard)

#### Blog Strategy (`src/core/questions/strategies/blog-strategy.ts`)

**Questions:**
- Content management
- Comments system
- Newsletter integration
- SEO requirements
- Social sharing

**Recommendations:**
- Database: Drizzle + Neon
- Auth: Better Auth
- UI: Shadcn UI
- Email: Resend (modern email API)

#### Dashboard Strategy (`src/core/questions/strategies/dashboard-strategy.ts`)

**Questions:**
- Data sources
- User roles and permissions
- Chart types
- Export capabilities
- Real-time updates

**Recommendations:**
- Database: Prisma + Supabase (rich ecosystem)
- Auth: Clerk (excellent dashboard features)
- UI: MUI (comprehensive component library)
- Email: Resend

## Usage Examples

### Basic Usage

```typescript
import { OrchestratorAgent } from '../agents/orchestrator-agent.js';

const orchestrator = new OrchestratorAgent();
const result = await orchestrator.execute({
  userInput: 'I want to build an e-commerce store for electronics',
  // ... other context
});
```

### Custom Strategy

```typescript
import { BaseQuestionStrategy } from '../core/questions/question-strategy.js';

export class CustomStrategy extends BaseQuestionStrategy {
  name = 'Custom Strategy';
  projectType = 'custom' as const;

  protected getProjectQuestions(context: ProjectContext): Question[] {
    return [
      {
        id: 'customFeature',
        type: 'select',
        name: 'customFeature',
        message: 'What custom feature do you need?',
        choices: [
          { name: 'Feature A', value: 'feature-a' },
          { name: 'Feature B', value: 'feature-b' }
        ]
      }
    ];
  }

  // ... implement other abstract methods
}
```

## Integration with Agents

### Orchestrator Agent Integration

The orchestrator agent uses the question system:

```typescript
export class OrchestratorAgent {
  private progressiveFlow: ProgressiveFlow;

  private async executeQuestionFlow(userInput: string): Promise<FlowResult> {
    const strategy = this.getQuestionStrategy(userInput);
    return await this.progressiveFlow.execute(userInput, strategy);
  }

  private getQuestionStrategy(userInput: string): BaseQuestionStrategy {
    const context = this.analyzeProjectContext(userInput);
    
    switch (context.type) {
      case 'ecommerce':
        return new EcommerceStrategy();
      case 'blog':
        return new BlogStrategy();
      case 'dashboard':
        return new DashboardStrategy();
      default:
        return new EcommerceStrategy();
    }
  }
}
```

## Benefits

### ✅ Advantages Over Old System

1. **Simpler Architecture**
   - 85% reduction in complexity
   - Clear separation of concerns
   - Easier to maintain and extend

2. **Better User Experience**
   - Intelligent recommendations
   - Progressive disclosure
   - Context-aware questions

3. **More Flexible**
   - Easy to add new project types
   - Customizable strategies
   - Pluggable recommendation engine

4. **Cleaner Code**
   - No complex question generators
   - Simple, readable code
   - Better testability

### 📊 Complexity Reduction

| Component | Old System | New System | Reduction |
|-----------|------------|------------|-----------|
| Question Generation | 1,200+ lines | 400 lines | 67% |
| Expert Mode | 624 lines | 0 lines | 100% |
| Plugin Questions | 500+ lines | 0 lines | 100% |
| **Total** | **2,324+ lines** | **400 lines** | **83%** |

## Best Practices

### 🎯 For Developers

1. **Always extend BaseQuestionStrategy** for new project types
2. **Provide meaningful recommendations** with confidence scores
3. **Use conditional questions** to reduce complexity
4. **Validate user input** at the agent level
5. **Keep questions focused** and relevant

### 🔧 For Plugin Developers

1. **Never generate questions** in plugins
2. **Provide comprehensive parameter schemas**
3. **Implement proper validation**
4. **Focus on core functionality**

### 🚀 For Agent Developers

1. **Use the progressive flow** for question orchestration
2. **Leverage recommendations** for better UX
3. **Handle validation** properly
4. **Provide clear error messages**

## Migration Guide

### From Old System

If you're migrating from the old dynamic question generator:

1. **Remove old imports:**
   ```typescript
   // OLD
   import { DynamicQuestionGenerator } from '../core/expert/dynamic-question-generator.js';
   
   // NEW
   import { ProgressiveFlow } from '../core/questions/progressive-flow.js';
   ```

2. **Update question generation:**
   ```typescript
   // OLD
   const questions = await this.questionGenerator.generateQuestions(plugin, context);
   
   // NEW
   const strategy = this.getQuestionStrategy(userInput);
   const result = await this.progressiveFlow.execute(userInput, strategy);
   ```

3. **Remove plugin question generation:**
   ```typescript
   // OLD - Remove this from plugins
   getDynamicQuestions(context: PluginContext): PluginQuestion[] {
     return this.questionGenerator.generateQuestions(this, context);
   }
   
   // NEW - Plugins don't generate questions
   getDynamicQuestions(context: PluginContext): Question[] {
     return []; // Agents handle questions
   }
   ```

## Future Enhancements

### 🚀 Planned Features

1. **AI-Powered Recommendations**
   - Machine learning for better suggestions
   - User behavior analysis
   - Performance-based recommendations

2. **Advanced Conditional Logic**
   - Complex dependency chains
   - Multi-step validations
   - Dynamic question ordering

3. **Internationalization**
   - Multi-language support
   - Localized recommendations
   - Cultural adaptations

4. **Analytics Integration**
   - Question performance tracking
   - User satisfaction metrics
   - A/B testing support

---

*This documentation covers the new Question Generation System. For plugin development, see [Plugin Development Guide](./plugin-development.md).* 