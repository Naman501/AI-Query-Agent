export const databaseSchema = `
Database: SQLite

Table: products
- id: INTEGER, primary key, auto-increment
- name: TEXT, required
- category: TEXT, required
- price: REAL, required
- stock: INTEGER, required, default 0
- created_at: TEXT, default CURRENT_TIMESTAMP

Table: sales
- id: INTEGER, primary key, auto-increment
- product_id: INTEGER, required, foreign key references products.id
- quantity: INTEGER, required
- total_amount: REAL, required
- sale_date: TEXT, default CURRENT_TIMESTAMP
- customer_name: TEXT, required
- region: TEXT, required

Relationships:
- products.id -> sales.product_id (one-to-many)
- Each sale belongs to one product.
- A product can have multiple sales.

Business rules:
- sales.total_amount represents the total amount for a sale.
- sales.quantity represents the number of units sold.
- products.stock represents the current available inventory.
`;

// data: {"type":"tool-output-available","toolCallId":"call_6HhBBRDXhybbRIPVD6XrAPA6","output":"\nDatabase: SQLite\n\nTable: products\n- id: INTEGER, primary key, auto-increment\n- name: TEXT, required\n- category: TEXT, required\n- price: REAL, required\n- stock: INTEGER, required, default 0\n- created_at: TEXT, default CURRENT_TIMESTAMP\n\nTable: sales\n- id: INTEGER, primary key, auto-increment\n- product_id: INTEGER, required, foreign key references products.id\n- quantity: INTEGER, required\n- total_amount: REAL, required\n- sale_date: TEXT, default CURRENT_TIMESTAMP\n- customer_name: TEXT, required\n- region: TEXT, required\n\nRelationships:\n- products.id -> sales.product_id (one-to-many)\n- Each sale belongs to one product.\n- A product can have multiple sales.\n\nBusiness rules:\n- sales.total_amount represents the total amount for a sale.\n- sales.quantity represents the number of units sold.\n- products.stock represents the current available inventory.\n","providerMetadata":{"openai":{"itemId":"fc_016d41d0654b26a9006ad5a6cfb6d087d1a5a427f62d165149"}},"dynamic":false}
