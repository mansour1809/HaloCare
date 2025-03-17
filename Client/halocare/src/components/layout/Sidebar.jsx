import  { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, Collapse } from '@mui/material';
import { Menu, ExpandLess, ExpandMore } from '@mui/icons-material';



const Sidebar = () => {
    const [openMenu, setOpenMenu] = useState(null);

    const handleClick = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const menuItems = [
        { title: 'רשימת ילדים', submenu: ['ילד 1', 'ילד 2'] },
        { title: 'רשימת צוות', submenu: ['צוות 1', 'צוות 2'] },
        { title: 'יומן', submenu: ['פגישה 1', 'פגישה 2'] },
        { title: 'דוחו"ת', submenu: ['דוח 1', 'דוח 2'] }
    ];

    return (
        <Drawer variant="permanent" anchor="right">
            <List>
                {menuItems.map((item) => (
                    <div key={item.title}>
                        <ListItem button onClick={() => handleClick(item.title)}>
                            <ListItemText primary={item.title} />
                            {openMenu === item.title ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openMenu === item.title} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {item.submenu.map((subItem) => (
                                    <ListItem button key={subItem} sx={{ pl: 4 }}>
                                        <ListItemText primary={subItem} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </div>
                ))}
            </List>
        </Drawer>
    );
};

const Navbar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    HALO CARE
                </Typography>
                <IconButton color="inherit">
                    <Menu />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

const Layout = () => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flexGrow: 1 }}>
                <Navbar />
                {/* תוכן עיקרי כאן */}
            </div>
        </div>
    );
};


export default Layout;
