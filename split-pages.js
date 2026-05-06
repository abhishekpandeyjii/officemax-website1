const fs = require('fs');

try {
    let html = fs.readFileSync('index.html', 'utf8');

    // 1. Extract Navigation
    const navMatch = html.match(/<nav class="navbar" id="navbar">[\s\S]*?<\/nav>/);
    if (!navMatch) throw new Error("Navbar not found");
    let oldNav = navMatch[0];

    // Update Links
    let newNav = oldNav
        .replace(/href="#home"/g, 'href="index.html"')
        .replace(/href="#about"/g, 'href="about.html"')
        .replace(/href="#services"/g, 'href="services.html"')
        .replace(/href="#gifting"/g, 'href="gifting.html"')
        .replace(/>Gifting</g, '>Corporate Gifting<')
        .replace(/href="#clients"/g, 'href="index.html#clients"')
        .replace(/href="#support"/g, 'href="index.html#support"')
        .replace(/href="#process"/g, 'href="index.html#process"')
        .replace(/href="#contact"/g, 'href="index.html#contact"');

    // Add Products to Nav
    newNav = newNav.replace(
        '<li><a href="services.html" class="nav-link">Services</a></li>',
        '<li><a href="services.html" class="nav-link">Services</a></li>\n                <li><a href="products.html" class="nav-link">Products</a></li>'
    );

    // Remove all active classes temporarily
    newNav = newNav.replace(/class="nav-link active"/g, 'class="nav-link"');

    // 2. Extract Footer
    const footerMatch = html.match(/<footer class="footer">[\s\S]*?<\/footer>/);
    let newFooter = footerMatch[0]
        .replace(/href="#home"/g, 'href="index.html"')
        .replace(/href="#about"/g, 'href="about.html"')
        .replace(/href="#services"/g, 'href="services.html"')
        .replace(/href="#gifting"/g, 'href="gifting.html"')
        .replace(/href="#process"/g, 'href="index.html#process"');

    // Also update footer to add Products
    newFooter = newFooter.replace(
        '<li><a href="services.html">Office Supplies</a></li>',
        '<li><a href="products.html">Products</a></li>\n                        <li><a href="services.html">Office Supplies</a></li>'
    );

    // Replace in main HTML
    html = html.replace(oldNav, newNav);
    html = html.replace(footerMatch[0], newFooter);

    // 3. Extract Sections
    const aboutMatch = html.match(/<section class="about" id="about">[\s\S]*?<\/section>/);
    const servicesMatch = html.match(/<section class="services" id="services">[\s\S]*?<\/section>/);
    const giftingMatch = html.match(/<section class="gifting" id="gifting">[\s\S]*?<\/section>/);

    const aboutSection = aboutMatch[0];
    const servicesSection = servicesMatch[0];
    const giftingSection = giftingMatch[0];

    // Create Products Section
    let productsSection = servicesSection
        .replace(/id="services"/g, 'id="products"')
        .replace(/class="services"/g, 'class="products"')
        .replace('What We Offer', 'Our Products')
        .replace('Comprehensive <span class="text-gradient">Office Solutions</span>', 'Premium <span class="text-gradient">Office Products</span>');

    // Generate Page Template Function
    const generatePage = (title, activeHref, content) => {
        let pageHeader = html.split('<section class="hero" id="home">')[0];

        // Fix title
        pageHeader = pageHeader.replace(
            /<title>.*<\/title>/,
            `<title>${title} | OfficeMax India</title>`
        );

        // Add active class
        pageHeader = pageHeader.replace(
            `href="${activeHref}" class="nav-link"`,
            `href="${activeHref}" class="nav-link active"`
        );

        // Add padding to content so it doesn't hide behind fixed navbar
        const paddedContent = `\n    <div style="padding-top: 100px;"></div>\n${content}\n`;

        // We include the contact section and footer for all pages
        const contactAndFooter = html.substring(html.indexOf('<section class="contact" id="contact">'));

        return pageHeader + paddedContent + contactAndFooter;
    };

    // Create new files
    fs.writeFileSync('about.html', generatePage('About Us', 'about.html', aboutSection));
    fs.writeFileSync('services.html', generatePage('Services', 'services.html', servicesSection));
    fs.writeFileSync('products.html', generatePage('Products', 'products.html', productsSection));
    fs.writeFileSync('gifting.html', generatePage('Corporate Gifting', 'gifting.html', giftingSection));

    // Remove sections from index.html to make it clean
    html = html.replace(aboutSection, '');
    html = html.replace(servicesSection, '');
    html = html.replace(giftingSection, '');

    // Make Home link active on index
    html = html.replace(
        'href="index.html" class="nav-link"',
        'href="index.html" class="nav-link active"'
    );

    fs.writeFileSync('index.html', html);
    console.log("Pages split successfully.");

} catch (err) {
    console.error("Error:", err);
}
