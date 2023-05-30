// Cart functions and Product display

const productDOM = document.querySelector(".seeds-container");
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");

let cart = [];

let buttonDOM = [];

// getting products
class Products {
    async getProducts() {
        try {
            let result = await fetch("seed-products.json");
            let data = await result.json()
            var products = data.items;
            products = products.map(Item => {
                const {title, price, category, desc} = Item.fields;
                const {id} = Item.sys;
                const image = Item.fields.image.fields.file.url;
                return {title, price, category, desc, id, image};
            });
            return products;

        } catch (error) {
            console.log(error);
        }
    }; 
};
// displaying products and cart logic
class UI {
    displayingProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <div class="seed">
                <div class="product-img-container">
                    <img src=${product.image} alt=${product.title} class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <div class="info">
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
                <p class="text">
                    ${product.desc}
                </p>
                </div>
            </div>
            `
        });
        productDOM.innerHTML = result; 
        console.log(productDOM);
    };

    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", event => {
                console.log(button);
                event.target.innerText = "In Cart";
                event.target.disabled = true;

                let cartItem = {...Storage.getProducts(id), amount: 1};

                cart = [...cart, cartItem];

                Storage.saveCart(cart);

                this.setCartValues(cart);

                this.addingToCart(cart);

                this.showCart(cart);
            });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price *item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(
            tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addingToCart(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
        <img src=${item.image} alt="product">
<div>
    <h4>${item.title}</h4>
    <h5>$${item.price}</h5>
    <span class="remove-item" data-id=${item.id}>remove</span>
</div>
<div>
    <i class="fas fa-chevron-up" data-id=${item.id}></i>
    <p class="item-amount">${item.amount}</p>
    <i class="fas fa-chevron-down" data-id=${item.id}></i>
</div>`
        cartContent.appendChild(div);
        console.log(cartContent);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
        console.log(cartBtn);
    }

    populateCart(cart) {
        cart.forEach(item => this.addingToCart(item));
    }

    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id);
                console.log(cartContent);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }

            }
        })
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id))
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
        console.log(this.removeItem());
    }

    removeItem(id) {
        cart = cart.filter( item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `
        <i class="fas fa-shopping-cart"></i>add to cart
        `
    }

    getSingleButton(id) {
        return buttonDOM.find(button => button.dataset.id === id);
    }
}

// cart and product storage 
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    };

    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id)
    };

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    };

    static getCart() {
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
    }
}

// loading
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setupApp();

    products.getProducts().then(products => {
        ui.displayingProducts(products);
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic()
    })
});

// fixed nav and show top-link!
const navBar = document.getElementById('nav');
const topLink = document.querySelector(".top-link");

window.addEventListener("scroll", () => {
    const scrollHeight = window.pageYOffset;
    const navHeight = navBar.getBoundingClientRect().height;

    // nav
     if (scrollHeight > navHeight) {
        navBar.classList.add("fixed-nav");
     } else {
        navBar.classList.remove("fixed-nav");
     }

    //  top-link
    if (scrollHeight > 500) {
        topLink.classList.add("show-link");
    } else {
        topLink.classList.remove("show-link");
    }
     
});

//  displaying feedbacks
const reviews = [
    {
        id: 1,
        name: "susan smith",
        usedProduct: "Apple seed",
        img: 'https://www.course-api.com/images/people/person-1.jpeg',
        text:
            `Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat modi provident reiciendis, minus eos magnam repellendus similique. Molestias ducimus eveniet, accusamus repellendus ab, aut ipsam omnis aliquam officia rerum maxime.`,
    },
    {
        id: 2,
        name: "anna johnson",
        usedProduct: "Mango seed",
        img: 'https://www.course-api.com/images/people/person-2.jpeg',
        text:
            `Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque sapiente dolores laudantium architecto repellendus molestiae earum vel itaque, voluptates magnam accusantium quibusdam excepturi, accusamus reprehenderit ipsum voluptatibus assumenda distinctio repellat.`,
    },
    {
        id: 3,
        name: "peter jones",
        usedProduct: "Lily seed",
        img: 'https://www.course-api.com/images/people/person-4.jpeg',
        text:
            `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit deleniti dolorem ex quo, reiciendis dolorum animi impedit alias in voluptate placeat voluptates porro optio voluptas est odit et dolores cumque.`,
    },
    {
        id: 4,
        name: "bill anderson",
        usedProduct: "Tomato seed",
        img: 'https://www.course-api.com/images/people/person-3.jpeg',
        text:
            `Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam porro veniam ullam provident consectetur ab neque id distinctio molestias, illum tempore doloribus facilis iusto voluptas? Iste quidem facilis aperiam nesciunt.`,
    },
]; 

const customerName = document.getElementById("customer");
const usedProduct = document.getElementById("usedProduct");
const userImage = document.getElementById("person-img")
const review = document.getElementById("review");

const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

let currentIndex = 0;

window.addEventListener("DOMContentLoaded", () => {
    const item = reviews[currentIndex];
    customerName.textContent = item.name;
    usedProduct.textContent = item.usedProduct;
    userImage.src = item.img;
    review.textContent = item.text;
});

function showPerson(person) {
    const item = reviews[person];
    customerName.textContent = item.name;
    usedProduct.textContent = item.usedProduct;
    userImage.src = item.img;
    review.textContent = item.text;
};

nextBtn.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex > reviews.length - 1) {
        currentIndex = 0;
    }
    showPerson(currentIndex);
});

prevBtn.addEventListener("click", () => {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex= reviews.length -Index
    showPerson(currentIndex); 
}});







