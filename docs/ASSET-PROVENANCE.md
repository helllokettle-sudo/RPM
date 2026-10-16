# Asset provenance — RPM Customs prototype

Reviewed and generated locally on 11 October 2026. No prototype assets have been uploaded to hosting.

## Client material

RPM Customs logo: https://rpmcustoms.no/assets/rpm-customs-logo-transparent-Cs8iSSlP.png

BMW product photograph: https://cdn.shopify.com/s/files/1/0711/1691/4858/files/IMG-0433.png?v=1781599361

Grey Carbon photograph: https://cdn.shopify.com/s/files/1/0711/1691/4858/files/IMG-0423.png?v=1781566730

Blue Forged photograph: https://cdn.shopify.com/s/files/1/0711/1691/4858/files/IMG-0443.png?v=1781601688

Seven additional brand product photograph URLs and titles are recorded in `product-photo-sources.json`. Original files are named `<brand>-product-original`. Runtime wheel face textures sample these photographs; their texture crops do not constitute accurate scanned 3D geometry.

`public-catalogue.json` records 71 public product titles, descriptions, links and image references from the client's Shopify storefront. No storefront credential is saved in the prototype. The brand landing pages add advertised classic/on-request platform families; those are included as presentation choices rather than verified purchasable fitments.

Lamborghini badge: https://cdn.simpleicons.org/lamborghini/c6ab67 — the source used in RPM’s navigation. Its SVG was assigned a 512-pixel rasterization size for the local WebGL texture. All branding remains associated with its respective owner.

## Generated interiors

Generated using the built-in Image Generation tool, generation mode, nontransparent background. Original PNGs are stored here; runtime WebP files keep the same framing and dimensions. These are photographic **concept** cabins, not photographs of a real customer vehicle or manufacturer-certified scans.

Normalized final prompt specification (the individual tool prompts used this visual direction):

> Photorealistic automotive interior photography, landscape 1536 × 1024. View from the left-hand driver's seated eye position. Show a convincing [vehicle interior below], with authentic-looking dashboard layout, instruments, vents, console, leather grain and stitching, natural reflections and realistic daylight. The steering wheel must be entirely removed, leaving the mounting column visible around 42% of image width and 54% of image height, with clear space for a separate steering wheel overlay. Looking through the windshield at a quiet Norwegian road and natural mountain/fjord surroundings. Camera and lighting should look like a professional real interior photograph, not a CGI render, illustration or low-poly model. No people, hands, watermark or promotional text.

Individual vehicle directions applied to that prompt:

- `bmw.png`: BMW G20 M Sport, black leather, wide instrument binnacle and horizontal infotainment display.
- `mercedes.png`: Mercedes-Benz W205 AMG Line, black leather, round turbine vents and freestanding center display.
- `audi.png`: Audi B9 S line, black leather, virtual instrument cluster and clean horizontal trim.
- `volkswagen.png`: Volkswagen Golf Mk7 GTI, dark cabin, characteristic instrument/center console arrangement.
- `porsche.png`: Porsche 911 991 Carrera, five-dial instrument layout and high center tunnel.
- `tesla.png`: Tesla Model 3, minimalist dark cabin, wood dashboard strip and center tablet.
- `lamborghini.png`: Lamborghini Huracán, angular dark cockpit and sports-car console.
- `toyota.png`: Toyota GR Supra A90, dark sports cabin and horizontal center display.
- `nissan.png`: Nissan GT-R R35, dark sports cockpit with instrument hood and center stack.

The final frames differ slightly in mounting position; renderer coordinates are stored per brand in `src/catalogue.js`. Generation used the same photographic direction while adapting each brand's cabin layout. Images are reused for other choices within the brand and labeled representative in the interface.

## Generated wheel cutout

Built-in Image Generation tool, **edit mode**, `transparent_background: true`, referencing the inspected local copy of RPM’s original IMG-0433 product photograph.

Final edit instruction:

> Preserve the steering wheel exactly: its silhouette, carbon pattern, Alcantara grain, BMW badge, controls, stitching, top marker, LED unit and paddles. Remove only the background, detached RPM logo and background shadow. Make the surrounding area and all open gaps through the wheel transparent. Do not redesign, alter colors, invent parts or add text. Return the clean photographic wheel cutout.

Saved as `wheel-cutout.png`, with a same-dimension WebP copy for delivery. This asset is the homepage product presentation and source of BMW hub/control textures. BMW flat carbon and black Alcantara surfaces also project the product photograph onto the interactive geometry. Other combinations use procedural material textures. Interactive geometry is separately modeled in code, so the 3D preview is a concept rather than a digitized replica of that photo.

## Code and delivery

Three.js / OrbitControls / RoomEnvironment: official Three.js npm package, version 0.186.1, MIT license included in `dist/THREE-LICENSE.txt`.

WebP encoding changes the file format for delivery; original PNG/JPEG design assets are retained. No generated image is presented as evidence of verified vehicle compatibility or exact model-specific cabin coverage.
