# Tạo thư mục chính
mkdir -p backend/{crypto,routes,keys,utils} frontend/{css,js,assets/{images,icons}} docs tests scripts

# Tạo các file rỗng
touch backend/server.js
touch backend/routes/{api.js,pages.js}
touch backend/crypto/{aes.js,rsa.js,hash.js,signature.js}
touch backend/utils/{keyGenerator.js,logger.js}
touch frontend/{index.html,advanced.html}
touch frontend/css/{style.css,responsive.css}
touch frontend/js/{simple-mode.js,advanced-mode.js,api.js,ui-helpers.js}
touch docs/{API_DOCS.md,DEPLOYMENT.md,PRESENTATION.md}
touch tests/{crypto.test.js,integration.test.js}
touch scripts/{generate-keys.js,seed-data.js}
touch package.json .gitignore README.md

echo "✅ Đã tạo xong cấu trúc thư mục!"