class FooterComponent extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <link rel="stylesheet" href="../css/footer.css">
            <div id="footer" class="footer">
                <img src="../image/logo.png" alt="Logo" class="logo-footer">
                <p><b>ENGLISH DICTIONARY</b></p>
                <span style="line-height:18px;">
                    <b>Assessment 2024</b><br/>
                    <br/>
                </span>
            </div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('footer-component', FooterComponent);
