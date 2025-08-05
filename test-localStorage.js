// Simple script to test localStorage clearing
// Run this in browser console

console.log('=== BEFORE CLEARING ===');
console.log('localStorage:', localStorage.getItem('police-training-app'));
console.log('sessionStorage:', sessionStorage.getItem('police-training-app'));

// Clear the storage
localStorage.removeItem('police-training-app');
sessionStorage.removeItem('police-training-app');

// Also try clearing all
localStorage.clear();
sessionStorage.clear();

console.log('=== AFTER CLEARING ===');
console.log('localStorage:', localStorage.getItem('police-training-app'));
console.log('sessionStorage:', sessionStorage.getItem('police-training-app'));

console.log('Please refresh the page now to see if tutorial shows up fresh');