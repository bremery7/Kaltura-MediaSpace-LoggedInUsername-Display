# Kaltura MediaSpace User Display Header

A standalone JavaScript solution for displaying the logged-in user's name in the Kaltura MediaSpace header, compatible with the new theming system that doesn't natively support this feature.

## Features

- **Username Display**: Shows the logged-in user's name next to the user menu icon
- **Login Prompt**: Displays "Login Here" when not authenticated, linking to `/user/login`
- **Clickable Username**: Opens the user menu when clicked (logged-in state)
- **Long Name Handling**: Truncates long names with ellipsis and shows full name on hover
- **Dynamic Updates**: Automatically updates on login/logout events
- **Fully Portable**: Works across all MediaSpace sites without modification

## Installation

1. Log in to your Kaltura MediaSpace admin backend
2. Navigate to the **Application Registry** settings
3. Find the **headerJSlinks** field
4. Copy the contents of `kaltura-user-display-header.js` and paste it into the field
5. Save your changes

## How It Works

The script:
1. Fetches user details from the `/user/get-details` API endpoint
2. Identifies the user menu button using `aria-label="user menu"`
3. Creates a clickable text element displaying the username
4. Positions it next to the user icon in the header
5. Listens for the `userDetailsPopulated` event to handle login/logout state changes

## Styling

The username text inherits the theme's styling and includes:
- Font size: 14px
- Font weight: 500
- Max width: 200px (with ellipsis for overflow)
- Tooltip showing full name on hover

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- Fetch API
- MutationObserver
- CSS Flexbox

## License

MIT License - Feel free to use and modify for your organization's needs.

## Support

For issues or questions, please open an issue in this repository.
