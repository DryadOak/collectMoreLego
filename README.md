# Collect More Lego

This is a little side projects I started to keep track of my Lego collection using the Brickset API. Please allow 50 seconds for initial spin up after inactivity. (Hopefully my partner never sees how much money I've spent on little bits of plastic. If you are reading this, I definitely won more than half of them in a giveaway, promise).

**Full Website:** https://collectmorelego.onrender.com/

## How It's Made:

**Technologies Used & Project Structure:**
- Server: The server is built with Express.js, which handles API requests, routes, and serves the client-side files.
- Brickset API: Provides data for Lego sets and themes using Brickset's API version 3. Brickset API Documentation.
- MongoDB: Stores user data, including collections and wishlists, with Mongoose for database modeling and interaction.
- EJS (Embedded JavaScript): Used for server-side templating to dynamically generate HTML views.
- Client: The client-side consists of HTML, CSS and JavaScript.

**Features:**
- Collection Tracking: Users can create a personal collection of Lego sets..
- Wishlist: Users can create a wishlist of desired Lego sets.
- Browsing and Search: Users can browse and search for Lego sets and themes.
- Sorting: Users can sort their collections and search results by various criteria such as set name, theme, year, etc.
- Editable Details: Details of the sets in the collection, such as purchase price and acquisition date, can be edited.

## Optimizations:
- Responsive Design: I built the project to be fully responsive, providing an optimal viewing experience on a variety of devices, from desktops to mobile phones.


## Lessons Learned:
This project has been a great opportunity to develop my understanding of various technologies and best practices in software development. Working with MongoDB has enhanced my understanding of NoSQL databases and their flexibility. I learned how to design schemas tailored to the application's needs and use Mongoose for data modeling and creating relationships between different collections. This made database operations more structured and less error-prone. Additionally, integrating the Brickset API provided valuable experience in working with third-party APIs. Understanding how to securely handle API keys, and ensuring that requests are authenticated properly.
