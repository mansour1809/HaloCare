// import React, { useState } from 'react';
// import { 
//   Box, 
//   Typography, 
//   List, 
//   ListItem, 
//   ListItemText, 
//   IconButton, 
//   Dialog, 
//   DialogTitle, 
//   DialogContent, 
//   TextField, 
//   Button,
//   DialogActions,
//   Avatar
// } from '@mui/material';
// import { Add, Delete, Edit } from '@mui/icons-material';

// const MessageBoard = () => {
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: 'לדניאל נולד אח',
//       author: 'טלי לוי',
//       timestamp: new Date('2025-03-25T10:30:00'),
//       avatar: '/api/placeholder/40/40'
//     }
//   ]);
  
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [currentMessage, setCurrentMessage] = useState({ text: '', author: '', avatar: '' });
//   const [editingMessage, setEditingMessage] = useState(null);

//   const formatDate = (date) => {
//     return date.toLocaleString('he-IL', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const handleAddMessage = () => {
//     if (currentMessage.text && currentMessage.author) {
//       const newMessage = {
//         id: messages.length + 1,
//         text: currentMessage.text,
//         author: currentMessage.author,
//         timestamp: new Date(),
//         avatar: currentMessage.avatar || `/api/placeholder/40/40`
//       };
//       setMessages([...messages, newMessage]);
//       setCurrentMessage({ text: '', author: '', avatar: '' });
//       setOpenAddDialog(false);
//     }
//   };

//   const handleEditMessage = () => {
//     if (editingMessage) {
//       setMessages(messages.map(msg => 
//         msg.id === editingMessage.id 
//           ? { ...msg, text: currentMessage.text } 
//           : msg
//       ));
//       setEditingMessage(null);
//       setCurrentMessage({ text: '', author: '', avatar: '' });
//     }
//   };

//   const handleDeleteMessage = (id) => {
//     setMessages(messages.filter(msg => msg.id !== id));
//   };

//   const openEditDialog = (message) => {
//     setEditingMessage(message);
//     setCurrentMessage({ 
//       text: message.text, 
//       author: message.author,
//       avatar: message.avatar 
//     });
//   };

//   return (
//     <Box sx={{ 
//       border: '1px solid #ddd', 
//       borderRadius: 2, 
//       p: 2, 
//       width: '100%', 
//       maxWidth: 400,
//       backgroundColor: 'white'
//     }}>
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         mb: 2 
//       }}>
//         <Typography variant="h6">לוח הודעות</Typography>
//         <IconButton 
//           color="primary" 
//           onClick={() => setOpenAddDialog(true)}
//         >
//           <Add />
//         </IconButton>
//       </Box>

//       <List sx={{ backgroundColor: 'white' }}>
//         {messages.map((message) => (
//           <ListItem 
//             key={message.id} 
//             divider
//             sx={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center'
//             }}
//             secondaryAction={
//               <>
//                 <IconButton 
//                   edge="end" 
//                   onClick={() => openEditDialog(message)}
//                 >
//                   <Edit />
//                 </IconButton>
//                 <IconButton 
//                   edge="end" 
//                   onClick={() => handleDeleteMessage(message.id)}
//                 >
//                   <Delete />
//                 </IconButton>
//               </>
//             }
//           >
//             <Box sx={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'flex-start',
//               width: '100%'
//             }}>
//               <Box sx={{ flexGrow: 1, marginLeft: 2 }}>
//                 <ListItemText
//                   primary={message.text}
//                   secondary={`${message.author} | ${formatDate(message.timestamp)}`}
//                 />
//               </Box>
//               <Avatar 
//                 src={message.avatar} 
//                 sx={{ 
//                   width: 40, 
//                   height: 40
//                 }} 
//               />
//             </Box>
//           </ListItem>
//         ))}
//       </List>

//       {/* Rest of the dialog remains the same */}
//       <Dialog 
//         open={openAddDialog || !!editingMessage} 
//         onClose={() => {
//           setOpenAddDialog(false);
//           setEditingMessage(null);
//           setCurrentMessage({ text: '', author: '', avatar: '' });
//         }}
//       >
//         {/* Previous dialog content remains unchanged */}
//       </Dialog>
//     </Box>
//   );
// };

// export default MessageBoard;