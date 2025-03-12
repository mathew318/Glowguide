let currentPage = 1;
const pages = ['uploadPage', 'questionnairePage', 'recommendationsPage'];
let imageUploaded = false;

// Handle file upload area
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'rgba(135, 206, 235, 0.2)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.backgroundColor = 'rgba(135, 206, 235, 0.05)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'rgba(135, 206, 235, 0.05)';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            imageUploaded = true;
            document.getElementById('uploadErrorMessage').style.display = 'none';
            
            // Display the image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // Update upload area text
            const uploadIcon = uploadArea.querySelector('.upload-icon');
            const uploadText = uploadArea.querySelector('p');
            if (uploadIcon) uploadIcon.style.display = 'none';
            if (uploadText) uploadText.textContent = file.name;
        }
    }
}

// Make entire radio/checkbox option clickable
document.querySelectorAll('.radio-option, .checkbox-option').forEach(option => {
    option.addEventListener('click', function(e) {
        // Prevent clicks on the input itself from triggering this twice
        if (e.target !== this.querySelector('input')) {
            const input = this.querySelector('input');
            if (input.type === 'radio') {
                input.checked = true;
            } else if (input.type === 'checkbox') {
                input.checked = !input.checked;
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Make entire checkbox option clickable
    document.querySelectorAll('.checkbox-option').forEach(option => {
        option.addEventListener('click', function(e) {
            // Prevent clicks on the input itself from triggering this twice
            if (e.target !== this.querySelector('input')) {
                const input = this.querySelector('input');
                input.checked = !input.checked;
                
                // Trigger any validation or event listeners if needed
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        });
    });
    
    // Add event listener for change image button
    document.getElementById("fileInput").addEventListener("change", async function () {
        let formData = new FormData();
        formData.append("skin_type", "oily");
        formData.append("concerns", JSON.stringify(["acne", "aging"]));
    
        let response = await fetch("http://127.0.0.1:8000/analyze/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                skin_type: "oily",
                concerns: ["acne", "aging"]
            })
        });
    
        let result = await response.json();
        console.log("Recommended Products:", result.recommended_products);
    });    
});

// Validation functions
function validateAndNextPage() {
    if (imageUploaded) {
        nextPage();
    } else {
        document.getElementById('uploadErrorMessage').style.display = 'block';
    }
}

function validateFormAndNextPage() {
    let isValid = true;
    
    // Validate skin type
    const skinTypeSelected = document.querySelector('input[name="skinType"]:checked');
    if (!skinTypeSelected) {
        document.getElementById('skinTypeErrorMessage').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('skinTypeErrorMessage').style.display = 'none';
    }
    
    // Validate skin concerns (at least one must be selected)
    const concernsSelected = document.querySelectorAll('input[name="concerns"]:checked');
    if (concernsSelected.length === 0) {
        document.getElementById('concernsErrorMessage').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('concernsErrorMessage').style.display = 'none';
    }
    
    // Validate product type
    const productTypeSelected = document.querySelector('input[name="productType"]:checked');
    if (!productTypeSelected) {
        document.getElementById('productTypeErrorMessage').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('productTypeErrorMessage').style.display = 'none';
    }
    
    if (isValid) {
        nextPage();
    }
}

// Navigation functions
function updateProgressBar() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= currentPage) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const newPage = document.getElementById(pageId);
    newPage.classList.add('active');
    
    // Add animation
    setTimeout(() => {
        newPage.style.transform = 'translateY(0)';
        newPage.style.opacity = '1';
    }, 50);
}

function nextPage() {
    if (currentPage < 3) {
        currentPage++;
        updateProgressBar();
        showPage(pages[currentPage - 1]);
        if (currentPage === 3) {
            showLoadingAnimation();
            setTimeout(loadRecommendations, 1500);
        }
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateProgressBar();
        showPage(pages[currentPage - 1]);
    }
}

function showLoadingAnimation() {
    const recommendationsContainer = document.getElementById('productRecommendations');
    recommendationsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div class="loading"></div>
            <p style="margin-top: 1rem; color: #666;">Analyzing your skin profile...</p>
        </div>
    `;
}

// Load recommendations
function loadRecommendations() {
    // Get form data
    const skinType = document.querySelector('input[name="skinType"]:checked').value;
    const allergiesInput = document.getElementById('allergiesInput').value;
    const concernsSelected = Array.from(document.querySelectorAll('input[name="concerns"]:checked')).map(el => el.value);
    const productType = document.querySelector('input[name="productType"]:checked').value;
    
    // Product database (in a real app, this would come from a backend API)
    const productDatabase = {
        cleanser: [
            {
                title: "Gentle Hydrating Cleanser",
                brand: "CeraVe",
                description: "Perfect for sensitive skin, this non-foaming cleanser removes impurities while maintaining skin barrier.",
                price: "$15.99",
                rating: "4.5/5",
                icon: "fas fa-soap",
                ingredients: ["ceramides", "hyaluronic acid", "glycerin"],
                skinTypes: ["dry", "sensitive", "combination"],
                concerns: ["dryness", "sensitivity"]
            },
            {
                title: "Foaming Facial Cleanser",
                brand: "Neutrogena",
                description: "Removes excess oil, makeup and impurities without over-drying or irritating skin.",
                price: "$9.99",
                rating: "4.2/5",
                icon: "fas fa-soap",
                ingredients: ["glycerin", "sodium laureth sulfate", "cocamidopropyl betaine"],
                skinTypes: ["oily", "combination", "normal"],
                concerns: ["acne", "oiliness"]
            },
            {
                title: "Soothing Cleanser",
                brand: "La Roche-Posay",
                description: "Gentle, soap-free cleanser that respects sensitive skin while effectively removing impurities.",
                price: "$14.99",
                rating: "4.7/5",
                icon: "fas fa-soap",
                ingredients: ["thermal spring water", "glycerin", "niacinamide"],
                skinTypes: ["sensitive", "dry", "normal"],
                concerns: ["redness", "sensitivity", "dryness"]
            }
        ],
        moisturizer: [
            {
                title: "Daily Moisturizing Lotion",
                brand: "CeraVe",
                description: "Lightweight, oil-free moisturizer that helps hydrate the skin and restore its natural barrier.",
                price: "$12.99",
                rating: "4.6/5",
                icon: "fas fa-pump-soap",
                ingredients: ["ceramides", "hyaluronic acid", "niacinamide"],
                skinTypes: ["normal", "dry", "combination"],
                concerns: ["dryness", "aging"]
            },
            {
                title: "Oil-Free Moisturizer",
                brand: "Neutrogena",
                description: "Lightweight water-based moisturizer that won't clog pores or cause breakouts.",
                price: "$8.99",
                rating: "4.3/5",
                icon: "fas fa-pump-soap",
                ingredients: ["glycerin", "dimethicone", "allantoin"],
                skinTypes: ["oily", "combination", "acne-prone"],
                concerns: ["oiliness", "acne"]
            },
            {
                title: "Rich Repair Cream",
                brand: "First Aid Beauty",
                description: "Intensive hydration for very dry or irritated skin with colloidal oatmeal.",
                price: "$24.00",
                rating: "4.8/5",
                icon: "fas fa-pump-soap",
                ingredients: ["colloidal oatmeal", "shea butter", "ceramides"],
                skinTypes: ["dry", "very dry", "sensitive"],
                concerns: ["eczema", "extreme dryness", "irritation"]
            }
        ],
        serum: [
            {
                title: "Vitamin C Brightening Serum",
                brand: "The Ordinary",
                description: "High-potency vitamin C serum that targets uneven skin tone and signs of aging.",
                price: "$19.99",
                rating: "4.5/5",
                icon: "fas fa-eye-dropper",
                ingredients: ["vitamin C", "hyaluronic acid", "ferulic acid"],
                skinTypes: ["all", "normal", "combination"],
                concerns: ["dark spots", "aging", "uneven tone"]
            },
            {
                title: "Niacinamide & Zinc Serum",
                brand: "The Inkey List",
                description: "Oil-controlling serum that reduces blemishes and minimizes the appearance of pores.",
                price: "$10.99",
                rating: "4.4/5",
                icon: "fas fa-eye-dropper",
                ingredients: ["niacinamide", "zinc", "glycerin"],
                skinTypes: ["oily", "combination", "acne-prone"],
                concerns: ["acne", "oiliness", "enlarged pores"]
            },
            {
                title: "Hyaluronic Acid Super Hydrator",
                brand: "La Roche-Posay",
                description: "Intense hydrating serum with pure hyaluronic acid for plump, dewy skin.",
                price: "$29.99",
                rating: "4.7/5",
                icon: "fas fa-eye-dropper",
                ingredients: ["hyaluronic acid", "glycerin", "vitamin B5"],
                skinTypes: ["dry", "normal", "dehydrated"],
                concerns: ["dryness", "dehydration", "fine lines"]
            }
        ],
        sunscreen: [
            {
                title: "Invisible Fluid SPF 50+",
                brand: "La Roche-Posay",
                description: "Ultra-light, invisible fluid with high protection against UVA/UVB rays.",
                price: "$29.99",
                rating: "4.8/5",
                icon: "fas fa-sun",
                ingredients: ["avobenzone", "homosalate", "octocrylene"],
                skinTypes: ["all", "sensitive", "normal"],
                concerns: ["sun protection", "aging prevention"]
            },
            {
                title: "Clear Face Oil-Free Sunscreen",
                brand: "Neutrogena",
                description: "Oil-free, non-comedogenic sunscreen that won't cause breakouts.",
                price: "$12.99",
                rating: "4.2/5",
                icon: "fas fa-sun",
                ingredients: ["avobenzone", "octisalate", "octocrylene"],
                skinTypes: ["oily", "combination", "acne-prone"],
                concerns: ["acne", "oiliness", "sun protection"]
            },
            {
                title: "Mineral Sensitive Skin Sunscreen",
                brand: "CeraVe",
                description: "Gentle physical sunscreen with zinc oxide for sensitive skin types.",
                price: "$15.99",
                rating: "4.5/5",
                icon: "fas fa-sun",
                ingredients: ["zinc oxide", "titanium dioxide", "ceramides"],
                skinTypes: ["sensitive", "dry", "eczema-prone"],
                concerns: ["sensitivity", "sun protection", "redness"]
            }
        ]
    };
    
    // Filter products based on user input
    const filteredProducts = productDatabase[productType].filter(product => {
        // Check if product suits user's skin type
        const suitsSkinType = product.skinTypes.includes(skinType) || product.skinTypes.includes("all");
        
        // Check if product addresses at least one of user's concerns
        const addressesConcerns = concernsSelected.some(concern => 
            product.concerns.includes(concern)
        );
        
        // Check for allergens (basic implementation - in real app would be more sophisticated)
        let containsAllergens = false;
        if (allergiesInput.trim() !== '') {
            const allergies = allergiesInput.toLowerCase().split(',').map(a => a.trim());
            containsAllergens = allergies.some(allergy => 
                product.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes(allergy)
                )
            );
        }
        
        return suitsSkinType && addressesConcerns && !containsAllergens;
    });
    
    // Display recommendations
    displayRecommendations(filteredProducts, productType);
}

function displayRecommendations(products, productType) {
    const recommendationsContainer = document.getElementById('productRecommendations');
    
    // Handle case with no matching products
    if (products.length === 0) {
        recommendationsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No matching products found</h3>
                <p>Try adjusting your skin profile or concerns to get more recommendations.</p>
                <button class="button secondary-button" onclick="previousPage()">Go Back</button>
            </div>
        `;
        return;
    }
    
    // Sort products by rating (highest first)
    products.sort((a, b) => {
        const ratingA = parseFloat(a.rating);
        const ratingB = parseFloat(b.rating);
        return ratingB - ratingA;
    });
    
    // Create HTML for product cards
    let productsHTML = '';
    products.forEach(product => {
        // Extract numeric value from rating
        const ratingValue = parseFloat(product.rating);
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = ratingValue % 1 >= 0.5;
        
        // Generate star rating HTML
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        
        // Generate ingredients list
        const ingredientsList = product.ingredients.map(ingredient => 
            `<span class="ingredient-tag">${ingredient}</span>`
        ).join('');
        
        // Create product card
        productsHTML += `
            <div class="product-card">
                <div class="product-icon">
                    <i class="${product.icon}"></i>
                </div>
                <div class="product-details">
                    <h3>${product.title}</h3>
                    <h4>${product.brand}</h4>
                    <p>${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">${product.price}</span>
                        <span class="product-rating">${starsHTML} ${product.rating}</span>
                    </div>
                    <div class="product-ingredients">
                        <p>Key ingredients:</p>
                        <div class="ingredients-list">
                            ${ingredientsList}
                        </div>
                    </div>
                    <button class="button primary-button"><a href="nav-bar/about.html" style="text-decoration:none;">About Us</a></button>
                </div>
            </div>
        `;
    });
    
    // Display product type heading
    const productTypeCapitalized = productType.charAt(0).toUpperCase() + productType.slice(1);
    
    // Update recommendations container - removed download button
    recommendationsContainer.innerHTML = `
        <div class="recommendations-header">
            <h2>Your Recommended ${productTypeCapitalized}s</h2>
            <p>Based on your skin profile and concerns</p>
        </div>
        <div class="product-grid">
            ${productsHTML}
        </div>
        <div class="recommendations-footer">
            <button class="button secondary-button" onclick="previousPage()">Adjust Profile</button>
        </div>
    `;
}


// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    updateProgressBar();
    showPage(pages[currentPage - 1]);
    
    // Add button event listeners
    document.getElementById('uploadNextButton').addEventListener('click', validateAndNextPage);
    document.getElementById('questionnaireBackButton').addEventListener('click', previousPage);
    document.getElementById('questionnaireNextButton').addEventListener('click', validateFormAndNextPage);
});