export const loader = async () => {
    // Replace with your actual domain
    const domain = "https://yourdomain.com";

    // Add your static routes here
    const staticRoutes = [
        "",
        "/graph",
        "/explore",
        "/data-explorer",
        "/ai-assistant",
        "/read",
        "/vision",
        "/why-knowledge-graph",
    ];

    const urls = staticRoutes.map((route) => {
        return `
    <url>
      <loc>${domain}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>0.8</priority>
    </url>
    `;
    });

    const content = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join("")}
</urlset>
  `.trim();

    return new Response(content, {
        status: 200,
        headers: {
            "Content-Type": "application/xml",
            "xml-version": "1.0",
            "encoding": "UTF-8",
        },
    });
};
