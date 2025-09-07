# 🔄 File Update Strategies

> **Complete guide to intelligent file updates in The Architech**

## 🎯 Overview

The Architech uses a **strategy-based file update system** that intelligently handles different file types and update scenarios. This system solves the common problem of file duplication while maintaining simplicity and performance.

## 🚨 The Problem We Solved

### **Before: File Duplication**
```
src/lib/auth/
├── config.ts              # Basic config
├── config-with-drizzle.ts # Drizzle integration (DUPLICATE!)
└── drizzle-adapter.ts     # Adapter
```

### **After: Intelligent Merging**
```
src/lib/auth/
├── config.ts              # Merged config with Drizzle
└── drizzle-adapter.ts     # Adapter
```

## 🔧 How It Works

### **1. Strategy-Based Approach**
```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/lib/auth/config.ts',
  strategy: 'merge',        // How to handle the file
  fileType: 'typescript',   // What type of file
  content: '// New content'
}
```

### **2. Automatic File Type Detection**
The system automatically detects file types based on extensions:
- `.ts`, `.tsx` → `typescript`
- `.js`, `.jsx` → `javascript`
- `.json` → `json`
- `.env`, `.env.example` → `env`
- Others → `auto`

### **3. Intelligent Processing**
Based on strategy and file type, the system:
- **Merges** TypeScript/JavaScript files intelligently
- **Deep merges** JSON files
- **Deduplicates** environment variables
- **Replaces** files by default

## 📋 Available Strategies

### **1. `replace` (Default)**
**Description**: Replace entire file content
**Use Case**: New files, complete rewrites
**Example**:
```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/components/Button.tsx',
  strategy: 'replace',
  content: `export function Button() {
  return <button>Click me</button>;
}`
}
```

### **2. `merge` (TypeScript/JavaScript)**
**Description**: Intelligently merge content
**Use Case**: Updating existing TypeScript/JavaScript files
**Example**:
```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/lib/auth/config.ts',
  strategy: 'merge',
  fileType: 'typescript',
  content: `import { drizzleAdapter } from './drizzle-adapter';

export const auth = betterAuth({
  database: drizzleAdapter,
  // ... rest of config
});`
}
```

**What it does**:
- ✅ Adds new imports
- ✅ Preserves existing imports
- ✅ Merges configuration objects
- ✅ Adds new functions
- ✅ Preserves existing functions

### **3. `append` (Environment Files)**
**Description**: Add content to end of file
**Use Case**: Environment variables, logs, documentation
**Example**:
```typescript
{
  type: 'ADD_CONTENT',
  target: '.env.example',
  strategy: 'append',
  content: `# New environment variables
NEW_API_KEY=your_api_key_here
NEW_SECRET=your_secret_here`
}
```

### **4. `prepend` (Setup Code)**
**Description**: Add content to beginning of file
**Use Case**: Imports, setup code, headers
**Example**:
```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/lib/utils.ts',
  strategy: 'prepend',
  content: `// New utility functions
export function newUtility() {
  return 'Hello World';
}`
}
```

## 🎯 File Type Handling

### **TypeScript/JavaScript Files**
**Strategy**: `merge`
**Features**:
- Import management (adds new, preserves existing)
- Export management (adds new, preserves existing)
- Function merging (adds new functions)
- Configuration merging (deep merges objects)

**Example**:
```typescript
// Existing file
import { betterAuth } from "better-auth";
export const auth = betterAuth({});

// New content
import { drizzleAdapter } from './drizzle-adapter';
export const auth = betterAuth({
  database: drizzleAdapter
});

// Result
import { betterAuth } from "better-auth";
import { drizzleAdapter } from './drizzle-adapter';
export const auth = betterAuth({
  database: drizzleAdapter
});
```

### **JSON Files**
**Strategy**: `merge` (automatic for package.json, tsconfig.json)
**Features**:
- Deep merging of nested objects
- Array merging
- Key preservation

**Example**:
```json
// Existing package.json
{
  "dependencies": {
    "react": "^18.0.0"
  }
}

// New content
{
  "dependencies": {
    "stripe": "^18.5.0"
  }
}

// Result
{
  "dependencies": {
    "react": "^18.0.0",
    "stripe": "^18.5.0"
  }
}
```

### **Environment Files**
**Strategy**: `append` (automatic for .env files)
**Features**:
- Deduplication by key
- Comment preservation
- Formatting maintenance

**Example**:
```bash
# Existing .env.example
DATABASE_URL=postgresql://localhost:5432/mydb

# New content
STRIPE_SECRET_KEY=sk_test_123
DATABASE_URL=postgresql://localhost:5432/mydb

# Result (deduplicated)
DATABASE_URL=postgresql://localhost:5432/mydb
STRIPE_SECRET_KEY=sk_test_123
```

## 🚀 Real-World Examples

### **Example 1: Better Auth + Drizzle Integration**

**Problem**: Without merging, creates duplicate config files
**Solution**: Use `merge` strategy

```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/lib/auth/config.ts',
  strategy: 'merge',
  fileType: 'typescript',
  content: `import { drizzleAdapterConfig } from './drizzle-adapter';

export const auth = betterAuth({
  database: drizzleAdapterConfig,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});`
}
```

**Result**: Updates existing config instead of creating new file

### **Example 2: Adding Environment Variables**

**Problem**: Duplicate environment variables
**Solution**: Use `append` strategy (automatic for .env files)

```typescript
{
  type: 'ADD_CONTENT',
  target: '.env.example',
  content: `# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key`
}
```

**Result**: Adds new variables without duplicating existing ones

### **Example 3: Package.json Dependencies**

**Problem**: Overwriting existing dependencies
**Solution**: Automatic deep merging for package.json

```typescript
{
  type: 'ADD_CONTENT',
  target: 'package.json',
  content: `{
  "dependencies": {
    "stripe": "^18.5.0",
    "better-auth": "^1.3.8"
  }
}`
}
```

**Result**: Adds new dependencies while preserving existing ones

## ⚠️ Current Limitations

### **1. TypeScript/JavaScript Merging**
- **Limited AST parsing**: Uses regex instead of proper AST
- **No semantic understanding**: Can't understand complex code structures
- **Basic function detection**: May miss complex function patterns
- **No type merging**: Doesn't merge TypeScript interfaces/types

### **2. Complex Code Structures**
- **No class merging**: Can't merge class definitions
- **No decorator handling**: Doesn't understand decorators
- **No JSX merging**: Limited JSX component merging
- **No conditional logic**: Can't handle complex conditional statements

### **3. Error Handling**
- **Basic error recovery**: Limited error handling for malformed code
- **No syntax validation**: Doesn't validate merged code
- **No conflict resolution**: Can't resolve complex merge conflicts

### **4. Performance**
- **Regex-based parsing**: Slower than AST-based parsing
- **No caching**: Re-parses content on every merge
- **Memory usage**: Loads entire file content into memory

## 🎯 When to Use Each Strategy

### **Use `replace` when:**
- Creating new files
- Complete rewrites
- Simple text files
- Configuration files that should be replaced entirely

### **Use `merge` when:**
- Updating existing TypeScript/JavaScript files
- Adding new imports/exports
- Extending existing configurations
- Adding new functions to existing files

### **Use `append` when:**
- Adding environment variables
- Adding log entries
- Adding documentation
- Adding new entries to lists

### **Use `prepend` when:**
- Adding imports to existing files
- Adding setup code
- Adding headers or comments
- Adding initialization code

## 🔮 Future Roadmap: AST-Based System

The current system is designed to be **simple and effective** for 85% of use cases. For the remaining 15%, we plan to implement an AST-based system.

### **Phase 1: Current System (V1)**
- ✅ Regex-based parsing
- ✅ Simple merging strategies
- ✅ Basic TypeScript/JavaScript support
- ✅ JSON and environment file handling

### **Phase 2: Enhanced Parsing (V2)**
- 🔄 Better regex patterns
- 🔄 Improved function detection
- 🔄 Basic class merging
- 🔄 JSX component merging

### **Phase 3: AST Integration (V3)**
- 🔮 Full TypeScript AST parsing
- 🔮 Semantic code understanding
- 🔮 Complex merge conflict resolution
- 🔮 Type-aware merging

### **Phase 4: Advanced Features (V4)**
- 🔮 Multi-file refactoring
- 🔮 Code transformation
- 🔮 Intelligent conflict resolution
- 🔮 Performance optimizations

## 📚 Best Practices

### **1. Choose the Right Strategy**
```typescript
// ✅ Good - Use merge for TypeScript files
{
  type: 'ADD_CONTENT',
  target: 'src/lib/config.ts',
  strategy: 'merge',
  content: '// Updated config'
}

// ❌ Bad - Use replace for TypeScript files
{
  type: 'ADD_CONTENT',
  target: 'src/lib/config.ts',
  strategy: 'replace',
  content: '// This will overwrite everything!'
}
```

### **2. Let Auto-Detection Work**
```typescript
// ✅ Good - Let system detect file type
{
  type: 'ADD_CONTENT',
  target: 'src/lib/config.ts',
  strategy: 'merge',
  content: '// Content'
}

// ❌ Bad - Unnecessary file type specification
{
  type: 'ADD_CONTENT',
  target: 'src/lib/config.ts',
  strategy: 'merge',
  fileType: 'typescript', // Redundant
  content: '// Content'
}
```

### **3. Use Appropriate Strategies**
```typescript
// ✅ Good - Use append for environment variables
{
  type: 'ADD_CONTENT',
  target: '.env.example',
  content: 'NEW_VAR=value'
}

// ✅ Good - Use merge for package.json
{
  type: 'ADD_CONTENT',
  target: 'package.json',
  content: '{"dependencies": {"new-package": "^1.0.0"}}'
}

// ✅ Good - Use replace for new files
{
  type: 'ADD_CONTENT',
  target: 'src/components/NewComponent.tsx',
  strategy: 'replace',
  content: 'export function NewComponent() {}'
}
```

## 🧪 Testing Your File Updates

### **1. Test with Dry Run**
```bash
# Test your blueprint without making changes
architech new my-recipe.yaml --dry-run
```

### **2. Check Generated Files**
```bash
# Verify files are updated correctly
ls -la src/lib/auth/
# Should show merged files, not duplicates
```

### **3. Validate Merged Content**
```bash
# Check that imports are merged correctly
grep -n "import" src/lib/auth/config.ts
# Should show all imports without duplicates
```

## 🤝 Contributing

### **Adding New File Types**
1. Add file type detection in `detectFileType()`
2. Add handling logic in `handleAddContent()`
3. Add specific merge method if needed
4. Update documentation

### **Improving Merging Logic**
1. Enhance regex patterns in merge methods
2. Add better error handling
3. Improve conflict resolution
4. Add performance optimizations

---

**The file update system strikes the right balance between simplicity and functionality, solving 85% of real-world problems with minimal complexity!** 🎉
