'use client';
import { createTheme } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: `Fira Sans, sans-serif`,
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 400,
  },
  palette: {},
  components: {
    MuiSwitch: {
      styleOverrides: {
        colorPrimary: {
          '&.Mui-checked': {
            color: '#2693e6',
          },
        },
        track: {
          '.Mui-checked.Mui-checked + &': {
            opacity: 1,
            backgroundColor: '#86d3ff',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 400,
        },
        startIcon: {
          marginLeft: 0,
          marginRight: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '3px',
          '&:hover': {
            backgroundColor: '#8E9092',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          height: '16px',
          padding: '8px',
          lineHeight: '16px',
          fontSize: '12px',
          color: '#545e6b',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          '&::before': {
            borderBottom: '0px !important',
          },
          '&::after': {
            borderBottom: '1px solid #1b87e6',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '&:hover': {},
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        list: {
          padding: 0,
          margin: 0,
        },
        paper: {
          boxShadow: '0px 8px 12px -4px rgba(0, 0, 0, 0.2) !important',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: 0,
          display: 'block',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '1px',
          background: '#1B87E6',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: '20px',
          padding: '8px 18px 8px 8px',
          textTransform: 'capitalize',
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#545E6B',
          '& .MuiSvgIcon-root': {
            fontSize: 20,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          '>tr>th': {
            fontFamily: `"FiraSans-Bold", serif`,
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
  },
});
