document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Sample properties data
    const properties = [
        {
            id: 1,
            title: "Departamento Moderno en Centro",
            location: "Centro, Ciudad",
            price: "$15,000/mes",
            bedrooms: 2,
            bathrooms: 2,
            area: "85 m²",
            image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 2,
            title: "Casa Familiar en Zona Residencial",
            location: "Colonia Residencial, Ciudad",
            price: "$25,000/mes",
            bedrooms: 3,
            bathrooms: 2,
            area: "120 m²",
            image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 3,
            title: "Loft Minimalista",
            location: "Zona Trendy, Ciudad",
            price: "$12,000/mes",
            bedrooms: 1,
            bathrooms: 1,
            area: "60 m²",
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 4,
            title: "Penthouse con Vista al Mar",
            location: "Zona Costera, Ciudad",
            price: "$40,000/mes",
            bedrooms: 3,
            bathrooms: 3,
            area: "150 m²",
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    ];

    // Sample testimonials data
    const testimonials = [
        {
            id: 1,
            quote: "Encontré mi departamento ideal en solo una semana. El servicio fue excelente y muy profesional.",
            author: "María González",
            role: "Arrendataria",
            image: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            id: 2,
            quote: "Como propietario, RentaHome me ha ayudado a encontrar inquilinos responsables rápidamente.",
            author: "Juan Pérez",
            role: "Propietario",
            image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            id: 3,
            quote: "La mejor plataforma para buscar rentas. La interfaz es muy intuitiva y tienen muchas opciones.",
            author: "Laura Martínez",
            role: "Arrendataria",
            image: "https://randomuser.me/api/portraits/women/63.jpg"
        }
    ];

    // Render properties
    const propertiesGrid = document.querySelector('.properties-grid');
    properties.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card';
        propertyCard.innerHTML = `
            <div class="property-img">
                <img src="${property.image}" alt="${property.title}">
            </div>
            <div class="property-info">
                <h3>${property.title}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                <div class="property-price">${property.price}</div>
                <div class="property-features">
                    <span><i class="fas fa-bed"></i> ${property.bedrooms}</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms}</span>
                    <span><i class="fas fa-ruler-combined"></i> ${property.area}</span>
                </div>
                <button class="btn btn-primary" style="width: 100%;">Ver Detalles</button>
            </div>
        `;
        propertiesGrid.appendChild(propertyCard);
    });

    // Render testimonials
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    testimonials.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.className = 'testimonial-card';
        testimonialCard.innerHTML = `
            <div class="quote">"${testimonial.quote}"</div>
            <div class="testimonial-author">
                <div class="author-img">
                    <img src="${testimonial.image}" alt="${testimonial.author}">
                </div>
                <div class="author-info">
                    <h4>${testimonial.author}</h4>
                    <p>${testimonial.role}</p>
                </div>
            </div>
        `;
        testimonialsSlider.appendChild(testimonialCard);
    });

    // Simple testimonial slider functionality
    let currentTestimonial = 0;
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    function showTestimonial(index) {
        testimonialCards.forEach((card, i) => {
            card.style.display = i === index ? 'block' : 'none';
        });
    }
    
    // Initialize
    showTestimonial(currentTestimonial);
    
    // Auto-rotate testimonials
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
        showTestimonial(currentTestimonial);
    }, 5000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});