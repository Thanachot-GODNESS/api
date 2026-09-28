"use client";

import { useEffect, useState } from "react";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type { Product, ProductDraft, ProductList, SearchQuery } from "@/lib/products";
import Image from "next/image";
import ProductSearchForm from "./ProductSearchForm";
import ProductForm from "./ProductForm";

type LoadState = "idle" | "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  // const [status, setStatus] = useState<LoadState>("idle");
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
    // เติม: สิ่งที่กำหนดให้ทำงานเพียงครั้งเดียวตอนแสดงผลครั้งแรก
  }, []);


  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
    );
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  function saveProduct(draft: ProductDraft) {
    // เติม: เครื่องหมายที่คัดลอกสมาชิกเดิมทั้งหมดของ Array
    setProducts([...products, { ...draft, id: Date.now() }]);
  }



  return (
    <main>
      <h1>รายการสินค้า</h1>

      <button
        type="button"
        onClick={() => loadProducts(defaultQuery)}
        disabled={status === "loading"}
      >
        {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
      </button>

      <ProductSearchForm onSearch={loadProducts} />

      {/* ส่วนแสดงผล เขียนเพิ่มในหัวข้อ 1.7 */}
      <section aria-live="polite">
        {status === "idle" && <p>คลิกปุ่มโหลดข้อมูลเพื่อเริ่ม</p>}

        {status === "loading" && <p>กำลังโหลดข้อมูล</p>}

        {status === "error" && <p role="alert">{errorMessage}</p>}

        {status === "ready" && products.length === 0 && (
          <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        )}

        {status === "ready" && products.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>รูป</th>
                <th>ชื่อสินค้า</th><th>ราคา</th>
                <th>คงเหลือ</th><th>หมวดหมู่</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {item.images.map((src, i) => (
                        <Image
                          key={`${item.id}-${i}`}
                          src={src}
                          alt={`${item.title} รูปที่ ${i + 1}`}
                          width={64}
                          height={64}
                          className="rounded object-cover"
                        />
                      ))}
                    </div>
                  </td>
                  <td>{item.title}</td>
                  <td>{item.price}</td>
                  <td>{item.stock}</td>
                  <td>{item.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div>
        <ProductForm
          editing={null}
          onSave={saveProduct}
          onCancel={() => { }}
        />

      </div>
    </main>

  );
}