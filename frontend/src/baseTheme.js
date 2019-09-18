import grey from '@material-ui/core/colors/grey'

const tableRowHeight = 40
const drawerWidth = 250
const modulesDrawerWidth = 250

export default {
  palette: {
    primary: {
      dark: '#45024b',
      main: '#6b346f',
      light: '#a686a9',
      lighter: '#d7c9d8',
    },
    favorites: '#fe941e',
    isfavorite: '#6a356f',
    contact: '#0d90b0',
    matchmakers: '#a686a9',
    messages: '#168c7f',
    notes: '#ba9746',
    codes: '#ba9746',
    recentlyViewed: '#6a356f',
    recentlyEngaged: '#47b149',
    diary: '#e43935',
    btnGreen: '#46b249',
    btnRed: '#c3643e',
    changes: '#6b346e',
  },
  typography: {
    useNextVariants: true,
    fontFamily: '"Arimo", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
  overrides: {
    MuiRadio: {
      colorSecondary: {
        '&$checked': {
          color: grey[900],
        },
      },
    },
    MuiCheckbox: {
      colorSecondary: {
        '&$checked': {
          color: grey[900],
        },
      },
    },
    MuiBadge: {
      badge: {
        height: 18,
        width: 18,
      },
      colorSecondary: {
        backgroundColor: '#EC1D24',
      },
    },
    MuiTab: {
      root: {
        '&:hover': {
          color: 'inherit',
          textDecoration: 'none',
        },
        '& $label': {
          fontSize: 15,
        },
      },
    },
    MuiTabIndicator: {
      root: {
        height: 3,
      },
    },
    MuiTable: {
      root: {
        minWidth: '100%',
        whiteSpace: 'nowrap',
        tableLayout: 'fixed',
        '& td, & th': {
          padding: [[0, 8]],
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
    },
    MuiTableRow: {
      root: {
        height: tableRowHeight,
      },
    },
    MuiTableCell: {
      paddingCheckbox: {
        textAlign: 'center',
      },
    },
    MuiIconButton: {
      root: {
        color: 'inherit',
      },
    },
    MuiDialog: {
      paperWidthSm: {
        maxWidth: 500,
      },
    },
    MuiDialogContent: {
      root: {
        paddingTop: 16,
        paddingBottom: 16,
      },
    },
  },
  drawerWidth,
  modulesDrawerWidth,
  tableRowHeight,
}
