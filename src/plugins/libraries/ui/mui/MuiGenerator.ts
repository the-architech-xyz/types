/**
 * Material-UI (MUI) Code Generator
 * 
 * Handles all code generation for Material-UI design system integration.
 * Based on: https://mui.com/getting-started/installation
 */

import { MuiConfig } from './MuiSchema.js';

export class MuiGenerator {
  
  static generateThemeConfig(config: MuiConfig): string {
    const theme = config.theme || 'light';
    const colorPrimary = config.colorPrimary || '#1976d2';
    const colorSecondary = config.colorSecondary || '#dc004e';
    const enableCustomTheme = config.enableCustomTheme || false;
    
    return `import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ${enableCustomTheme ? `
    primary: {
      main: '${colorPrimary}',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '${colorSecondary}',
      light: '#ff5983',
      dark: '#c51162',
      contrastText: '#fff',
    },` : `
    primary: {
      main: '${colorPrimary}',
    },
    secondary: {
      main: '${colorSecondary}',
    },`}
    ${theme === 'dark' ? `
    background: {
      default: mode === 'light' ? '#fff' : '#121212',
      paper: mode === 'light' ? '#fff' : '#1e1e1e',
    },` : ''}
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  ${config.enableAnimations ? `
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },` : ''}
});

export const theme = createTheme(getDesignTokens('${theme}'));

export default theme;
`;
  }

  static generateProviderSetup(config: MuiConfig): string {
    const enableSSR = config.enableSSR !== false;
    const enableRTL = config.enableRTL || false;
    
    return `import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import theme from './theme';

${enableSSR ? `
// Create emotion cache for SSR
const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true });
};

const clientSideEmotionCache = createEmotionCache();` : ''}

interface MuiProviderProps {
  children: React.ReactNode;
  ${enableSSR ? 'emotionCache?: any;' : ''}
}

export function MuiProvider({ 
  children, 
  ${enableSSR ? 'emotionCache = clientSideEmotionCache' : ''}
}: MuiProviderProps) {
  return (
    <CacheProvider value={${enableSSR ? 'emotionCache' : 'createCache({ key: "css" })'}}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

export default MuiProvider;
`;
  }

  static generateComponentExamples(config: MuiConfig): string {
    const components = config.components || ['Button', 'TextField', 'Card', 'Typography', 'Box', 'Stack', 'Grid', 'AppBar', 'Drawer'];
    
    return `import React from 'react';
${components.includes('Button') ? `import { Button, ButtonGroup } from '@mui/material';` : ''}
${components.includes('TextField') ? `import { TextField } from '@mui/material';` : ''}
${components.includes('Card') ? `import { Card, CardContent, CardActions, CardHeader } from '@mui/material';` : ''}
${components.includes('Typography') ? `import { Typography } from '@mui/material';` : ''}
${components.includes('Box') ? `import { Box } from '@mui/material';` : ''}
${components.includes('Stack') ? `import { Stack } from '@mui/material';` : ''}
${components.includes('Grid') ? `import { Grid } from '@mui/material';` : ''}
${components.includes('AppBar') ? `import { AppBar, Toolbar } from '@mui/material';` : ''}
${components.includes('Drawer') ? `import { Drawer, List, ListItem, ListItemText } from '@mui/material';` : ''}

// Example components using Material-UI
export function ExampleButton() {
  return (
    <Button variant="contained" color="primary" size="large">
      Click me
    </Button>
  );
}

export function ExampleLayout() {
  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Welcome to Material-UI
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is an example of Material-UI components in action.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary">
            Primary
          </Button>
          <Button variant="outlined" color="secondary">
            Secondary
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export function ExampleForm() {
  return (
    <Stack spacing={3} sx={{ maxWidth: 400 }}>
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        helperText="We'll never share your email."
      />
      
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
      />
      
      <Button variant="contained" color="primary" type="submit">
        Submit
      </Button>
    </Stack>
  );
}

export function ExampleCard() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        title="Card Title"
        subheader="Card Subtitle"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          This is a simple card component built with Material-UI.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          Action 1
        </Button>
        <Button size="small" color="secondary">
          Action 2
        </Button>
      </CardActions>
    </Card>
  );
}

export function ExampleGrid() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Grid Item 1</Typography>
            <Typography variant="body2">Content for grid item 1</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Grid Item 2</Typography>
            <Typography variant="body2">Content for grid item 2</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Grid Item 3</Typography>
            <Typography variant="body2">Content for grid item 3</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
`;
  }

  static generateUnifiedIndex(): string {
    return `/**
 * Unified UI Interface - Material-UI Implementation
 * 
 * This file provides a unified interface for UI components
 * that works with Material-UI. It abstracts away Material-UI-specific
 * details and provides a clean API for UI operations.
 * 
 * Based on: https://mui.com/getting-started/installation
 */

// ============================================================================
// CORE UI EXPORTS
// ============================================================================

export { default as theme } from './theme.js';
export { MuiProvider } from './provider.js';

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { 
  ExampleButton, 
  ExampleLayout, 
  ExampleForm, 
  ExampleCard,
  ExampleGrid
} from './components.js';

// ============================================================================
// MATERIAL-UI RE-EXPORTS
// ============================================================================

// Layout components
export { 
  Box, 
  Container, 
  Grid, 
  Stack,
  Paper,
  Divider
} from '@mui/material';

// Typography components
export { 
  Typography, 
  Link, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  ListItemButton,
  ListItemAvatar,
  ListSubheader
} from '@mui/material';

// Form components
export { 
  Button, 
  ButtonGroup, 
  TextField, 
  InputAdornment,
  FormControl,
  FormLabel,
  FormHelperText,
  FormControlLabel,
  Select,
  MenuItem,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Autocomplete
} from '@mui/material';

// Feedback components
export { 
  Alert, 
  AlertTitle, 
  AlertDescription, 
  Snackbar,
  useSnackbar,
  LinearProgress,
  CircularProgress,
  Skeleton,
  SkeletonText
} from '@mui/material';

// Overlay components
export { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  DialogContentText,
  Drawer,
  Tooltip,
  Popover,
  PopoverOrigin,
  Menu,
  MenuItem as MenuItemComponent
} from '@mui/material';

// Navigation components
export { 
  Breadcrumbs, 
  BreadcrumbItem, 
  AppBar, 
  Toolbar, 
  IconButton,
  Tabs,
  Tab,
  TabPanel,
  TabContext,
  TabList
} from '@mui/material';

// Data display components
export { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Chip,
  Avatar,
  AvatarGroup,
  Badge,
  Divider as DividerComponent
} from '@mui/material';

// Media components
export { 
  Image, 
  ImageList, 
  ImageListItem, 
  ImageListItemBar,
  Icon 
} from '@mui/material';

// ============================================================================
// HOOKS AND UTILITIES
// ============================================================================

export { 
  useTheme,
  useMediaQuery,
  useSnackbar,
  useDialog,
  usePopover,
  useMenu,
  useTab,
  useAutocomplete,
  usePagination,
  useSortBy,
  useTable
} from '@mui/material';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  theme,
  MuiProvider,
  ExampleButton,
  ExampleLayout,
  ExampleForm,
  ExampleCard,
  ExampleGrid
};
`;
  }

  static generateEnvConfig(config: MuiConfig): string {
    return `# Material-UI Configuration
MUI_THEME="${config.theme || 'light'}"
MUI_COLOR_PRIMARY="${config.colorPrimary || '#1976d2'}"
MUI_COLOR_SECONDARY="${config.colorSecondary || '#dc004e'}"
MUI_ENABLE_EMOTION="${config.enableEmotion !== false ? 'true' : 'false'}"
MUI_ENABLE_STYLED_COMPONENTS="${config.enableStyledComponents ? 'true' : 'false'}"
MUI_ENABLE_ICONS="${config.enableIcons !== false ? 'true' : 'false'}"
MUI_ENABLE_ANIMATIONS="${config.enableAnimations !== false ? 'true' : 'false'}"
MUI_ENABLE_RTL="${config.enableRTL ? 'true' : 'false'}"
MUI_ENABLE_TYPESCRIPT="${config.enableTypeScript !== false ? 'true' : 'false'}"
MUI_ENABLE_REACT="${config.enableReact !== false ? 'true' : 'false'}"
MUI_ENABLE_NEXTJS="${config.enableNextJS ? 'true' : 'false'}"
MUI_ENABLE_CUSTOM_THEME="${config.enableCustomTheme ? 'true' : 'false'}"
MUI_ENABLE_THEME_TOKENS="${config.enableThemeTokens !== false ? 'true' : 'false'}"
MUI_ENABLE_RESPONSIVE_DESIGN="${config.enableResponsiveDesign !== false ? 'true' : 'false'}"
MUI_ENABLE_ACCESSIBILITY="${config.enableAccessibility !== false ? 'true' : 'false'}"
MUI_ENABLE_PERFORMANCE="${config.enablePerformance !== false ? 'true' : 'false'}"
MUI_ENABLE_SSR="${config.enableSSR !== false ? 'true' : 'false'}"
`;
  }

  static generatePackageJson(config: MuiConfig): string {
    const dependencies = ['@mui/material'];
    const devDependencies = ['@types/react', '@types/react-dom'];
    
    if (config.enableEmotion !== false) {
      dependencies.push('@emotion/react', '@emotion/styled');
    }
    
    if (config.enableStyledComponents) {
      dependencies.push('@mui/styled-engine-sc');
      devDependencies.push('styled-components', '@types/styled-components');
    }
    
    if (config.enableIcons !== false) {
      dependencies.push('@mui/icons-material');
    }
    
    if (config.enableNextJS) {
      dependencies.push('@mui/material-next');
    }
    
    if (config.enableTypeScript !== false) {
      devDependencies.push('typescript');
    }
    
    return JSON.stringify({
      dependencies: dependencies.reduce((acc, dep) => {
        acc[dep] = '^5.15.0';
        return acc;
      }, {} as Record<string, string>),
      devDependencies: devDependencies.reduce((acc, dep) => {
        acc[dep] = '^18.0.0';
        return acc;
      }, {} as Record<string, string>)
    }, null, 2);
  }
} 