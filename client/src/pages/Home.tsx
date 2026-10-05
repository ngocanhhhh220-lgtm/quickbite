import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Heart,
  Landmark,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  TicketPercent,
  Trash2,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { calculateDeliveryFee, calculateOrderTotal, formatPrice } from "@shared/quickbite";

type Category = "Tất cả" | "Burger" | "Pizza" | "Gà rán" | "Ăn kèm" | "Đồ uống";

type Product = {
  id: number;
  name: string;
  category: Exclude<Category, "Tất cả">;
  price: number;
  description: string;
  image: string;
  tag?: string;
  rating: number;
};

type CartLine = Product & { quantity: number };

type PaymentMethod = "bank" | "momo" | "shopeepay" | "zalopay";

const paymentMethods: { id: PaymentMethod; label: string; description: string; icon: typeof Landmark; color: string }[] = [
  { id: "bank", label: "Chuyển khoản ngân hàng", description: "VietQR • xử lý tức thì", icon: Landmark, color: "#1570a6" },
  { id: "momo", label: "Ví MoMo", description: "Quét mã bằng ứng dụng MoMo", icon: Smartphone, color: "#b6207d" },
  { id: "shopeepay", label: "ShopeePay", description: "Quét mã bằng ứng dụng Shopee", icon: CreditCard, color: "#ee4d2d" },
  { id: "zalopay", label: "ZaloPay", description: "Quét mã bằng ứng dụng Zalo", icon: Smartphone, color: "#1677ff" },
];

// Thay các giá trị này bằng tài khoản nhận tiền thật trước khi mở thanh toán production.
const paymentConfig = {
  bankName: "Vietcombank",
  bankAccount: "0123456789",
  accountName: "QUICKBITE FOOD",
  momoAccount: "0901234567",
  shopeePayAccount: "quickbite.shop",
  zaloPayAccount: "0901234567",
};

const categories: { label: Category; emoji: string }[] = [
  { label: "Tất cả", emoji: "✦" },
  { label: "Burger", emoji: "🍔" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Gà rán", emoji: "🍗" },
  { label: "Ăn kèm", emoji: "🍟" },
  { label: "Đồ uống", emoji: "🥤" },
];

const products: Product[] = [
  {
    id: 1,
    name: "Classic Smash",
    category: "Burger",
    price: 79000,
    description: "Bò nướng smash, cheddar tan chảy, dưa chuột muối và sốt nhà làm.",
    image: "/manus-storage/burger-fries_0e0770fe.jpg",
    tag: "Best seller",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Crispy Chicken",
    category: "Gà rán",
    price: 89000,
    description: "Gà giòn rụm, coleslaw tươi, mật ong cay và bánh brioche mềm.",
    image: "/manus-storage/chicken-burger_192317a4.jpg",
    tag: "Mới ra mắt",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Taco Fiesta Pizza",
    category: "Pizza",
    price: 159000,
    description: "Pizza đế mỏng, bò cay, salsa tươi, jalapeño và phô mai kéo sợi.",
    image: "/manus-storage/taco-pizza_c1e1ea4b.jpg",
    tag: "Ưu đãi tuần",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Street Taco Box",
    category: "Gà rán",
    price: 119000,
    description: "Ba chiếc taco gà nướng, hành tím ngâm và sốt cilantro chanh.",
    image: "/manus-storage/tacos_d9ba72f5.webp",
    rating: 4.8,
  },
  {
    id: 5,
    name: "Double Cheese",
    category: "Burger",
    price: 109000,
    description: "Hai lớp bò smash, double cheddar, hành caramel và sốt tiêu đen.",
    image: "/manus-storage/burger-fries_0e0770fe.jpg",
    rating: 4.9,
  },
  {
    id: 6,
    name: "Loaded Fries",
    category: "Ăn kèm",
    price: 59000,
    description: "Khoai tây chiên giòn, phô mai, thịt xông khói và sốt ranch.",
    image: "/manus-storage/burger-fries_0e0770fe.jpg",
    rating: 4.6,
  },
  {
    id: 7,
    name: "Peach Oolong",
    category: "Đồ uống",
    price: 39000,
    description: "Trà ô long đào, thơm nhẹ, ít ngọt và uống cực đã.",
    image: "/manus-storage/tacos_d9ba72f5.webp",
    rating: 4.8,
  },
  {
    id: 8,
    name: "Mushroom Melt",
    category: "Burger",
    price: 99000,
    description: "Bò nướng, nấm bơ tỏi, swiss cheese và sốt mustard kem.",
    image: "/manus-storage/chicken-burger_192317a4.jpg",
    rating: 4.7,
  },
];

function ProductCard({
  product,
  isFavorite,
  onFavorite,
  onAdd,
}: {
  product: Product;
  isFavorite: boolean;
  onFavorite: () => void;
  onAdd: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-[#ede7dc] bg-white transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(39,32,20,0.1)]">
      <div className="relative aspect-[1.28] overflow-hidden bg-[#f0eadf]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {product.tag ? (
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f04b2d] shadow-sm">
              {product.tag}
            </span>
          ) : (
            <span />
          )}
          <button
            aria-label={`Yêu thích ${product.name}`}
            onClick={onFavorite}
            className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 transition hover:scale-105 ${isFavorite ? "text-[#f04b2d]" : "text-[#675f53]"}`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-display text-[21px] font-extrabold leading-tight text-[#272014]">{product.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#a36a24]"><Star className="h-3.5 w-3.5 fill-current" />{product.rating}</span>
        </div>
        <p className="min-h-[42px] text-sm leading-6 text-[#7d756b]">{product.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-display text-xl font-black text-[#f04b2d]">{formatPrice(product.price)}</span>
          <Button onClick={onAdd} className="h-10 rounded-full bg-[#272014] px-4 text-xs font-bold text-white hover:bg-[#f04b2d]">
            Thêm món <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function CartDrawer({
  cart,
  subtotal,
  onClose,
  onChangeQuantity,
  onRemove,
  onCheckout,
}: {
  cart: CartLine[];
  subtotal: number;
  onClose: () => void;
  onChangeQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}) {
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = calculateOrderTotal(subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#272014]/35 backdrop-blur-[2px]" onClick={onClose}>
      <aside className="flex h-full w-full max-w-[440px] flex-col bg-[#fffaf4] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#ede7dc] px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f04b2d]">Đơn của bạn</p>
            <h2 className="font-display text-2xl font-black text-[#272014]">Giỏ hàng <span className="text-[#a59a8d]">({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h2>
          </div>
          <button aria-label="Đóng giỏ hàng" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#6b6258] hover:bg-[#f4eee5]"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#ffeadf] text-[#f04b2d]"><ShoppingBag className="h-7 w-7" /></div>
                <h3 className="font-display text-xl font-black text-[#272014]">Giỏ hàng đang trống</h3>
                <p className="mt-2 max-w-[240px] text-sm leading-6 text-[#8a8176]">Thêm một món ngon để bắt đầu bữa ăn của bạn nhé.</p>
                <Button onClick={onClose} className="mt-5 rounded-full bg-[#f04b2d] font-bold hover:bg-[#d93a20]">Xem thực đơn</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-[0_5px_18px_rgba(39,32,20,0.05)]">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><h3 className="truncate font-bold text-[#272014]">{item.name}</h3><button aria-label={`Xóa ${item.name}`} onClick={() => onRemove(item.id)} className="text-[#b5aa9c] hover:text-[#f04b2d]"><Trash2 className="h-4 w-4" /></button></div>
                    <p className="mt-1 text-sm font-bold text-[#f04b2d]">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button aria-label="Giảm số lượng" onClick={() => onChangeQuantity(item.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-[#e6ded4] text-[#70675c] hover:border-[#f04b2d] hover:text-[#f04b2d]"><Minus className="h-3 w-3" /></button>
                      <span className="w-5 text-center text-sm font-bold text-[#272014]">{item.quantity}</span>
                      <button aria-label="Tăng số lượng" onClick={() => onChangeQuantity(item.id, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-[#272014] text-white hover:bg-[#f04b2d]"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-dashed border-[#edc9ba] bg-[#fff3ec] p-4 text-sm text-[#855a4d]"><TicketPercent className="mr-2 inline h-4 w-4 text-[#f04b2d]" />Mã <strong>QUICK10</strong> sẽ được áp dụng tự động cho đơn từ 200.000đ.</div>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-[#ede7dc] bg-white px-6 py-5">
            <div className="space-y-2 text-sm"><div className="flex justify-between text-[#7d756b]"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between text-[#7d756b]"><span>Phí giao hàng</span><span>{deliveryFee === 0 ? "Miễn phí" : formatPrice(deliveryFee)}</span></div><div className="mt-3 flex justify-between border-t border-[#eee7dd] pt-3 font-display text-xl font-black text-[#272014]"><span>Tổng cộng</span><span className="text-[#f04b2d]">{formatPrice(total)}</span></div></div>
            <Button onClick={onCheckout} className="mt-5 h-12 w-full rounded-full bg-[#f04b2d] text-sm font-black text-white shadow-[0_10px_24px_rgba(240,75,45,0.25)] hover:bg-[#d93a20]">Tiến hành đặt món <ArrowRight className="h-4 w-4" /></Button>
            <p className="mt-3 text-center text-[11px] text-[#a59a8d]">Thanh toán khi nhận hàng • Giao trong 25–35 phút</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function PaymentModal({
  total,
  onClose,
  onPaid,
}: {
  total: number;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("bank");
  const selected = paymentMethods.find((item) => item.id === method)!;
  const orderCode = "QB-2409";
  const account = method === "bank" ? paymentConfig.bankAccount : method === "momo" ? paymentConfig.momoAccount : method === "shopeepay" ? paymentConfig.shopeePayAccount : paymentConfig.zaloPayAccount;
  const paymentText = method === "bank"
    ? `Thanh toan ${orderCode} ${total}`
    : `QuickBite ${orderCode} ${total}`;
  const qrPayload = method === "bank" ? `https://img.vietqr.io/image/VCB-${paymentConfig.bankAccount}-compact2.png?amount=${total}&addInfo=${paymentText}&accountName=${paymentConfig.accountName}` : `${selected.label}|${account}|${paymentText}|${total}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(qrPayload)}`;

  const copyTransferInfo = async () => {
    try {
      await navigator.clipboard.writeText(account);
      toast.success("Đã sao chép thông tin thanh toán");
    } catch {
      toast.info(account);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#272014]/45 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[#fffaf4] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#ede7dc] px-6 py-5 md:px-8">
          <div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f04b2d]">Thanh toán đơn hàng</p><h2 className="mt-1 font-display text-2xl font-black text-[#272014]">Chọn cách thanh toán</h2></div>
          <button aria-label="Đóng thanh toán" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#6b6258] hover:bg-[#f4eee5]"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_0.9fr] md:p-8">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#8f8477]">Phương thức hỗ trợ QR</p>
            <div className="space-y-2.5">
              {paymentMethods.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setMethod(item.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${method === item.id ? "border-[#f04b2d] bg-[#fff0e9] shadow-[0_5px_15px_rgba(240,75,45,0.08)]" : "border-[#e9dfd3] bg-white hover:border-[#f2b5a3]"}`}><span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ backgroundColor: item.color }}><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#272014]">{item.label}</strong><span className="mt-0.5 block text-[11px] text-[#958a7d]">{item.description}</span></span>{method === item.id && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f04b2d]" />}</button>; })}
            </div>
            <div className="mt-5 rounded-2xl border border-[#f0dfb3] bg-[#fff8df] p-4 text-xs leading-5 text-[#8e6c28]"><strong className="text-[#6f531b]">Lưu ý:</strong> Đây là màn hình thanh toán QR demo. Hãy thay thông tin tài khoản trong <code className="rounded bg-white/70 px-1">paymentConfig</code> trước khi nhận thanh toán thật.</div>
          </div>
          <div className="rounded-[24px] bg-white p-5 text-center shadow-[0_8px_25px_rgba(39,32,20,0.06)]"><p className="text-xs font-bold text-[#8f8477]">Quét mã để thanh toán</p><div className="mx-auto mt-4 grid h-[190px] w-[190px] place-items-center overflow-hidden rounded-2xl border border-[#eee7dd] bg-white"><img src={qrUrl} alt={`Mã QR thanh toán ${selected.label}`} className="h-full w-full object-contain" /></div><p className="mt-4 font-display text-2xl font-black text-[#f04b2d]">{formatPrice(total)}</p><p className="mt-1 text-xs text-[#958a7d]">Mã đơn: <strong className="text-[#272014]">{orderCode}</strong></p><div className="mt-4 rounded-xl bg-[#faf6ef] p-3 text-left text-xs"><p className="font-bold text-[#272014]">{method === "bank" ? `${paymentConfig.bankName} • ${paymentConfig.accountName}` : selected.label}</p><div className="mt-1 flex items-center justify-between gap-2 text-[#84796c]"><span className="truncate">{account}</span><button onClick={copyTransferInfo} aria-label="Sao chép tài khoản" className="shrink-0 text-[#f04b2d] hover:text-[#c83a22]"><Copy className="h-3.5 w-3.5" /></button></div><p className="mt-1 text-[10px] text-[#a69b8d]">Nội dung: {paymentText}</p></div><Button onClick={onPaid} className="mt-5 h-11 w-full rounded-full bg-[#f04b2d] font-black text-white hover:bg-[#d93a20]">Tôi đã thanh toán <Check className="h-4 w-4" /></Button><button onClick={onClose} className="mt-3 text-xs font-bold text-[#958a7d] hover:text-[#f04b2d]">Đổi phương thức khác</button></div>
        </div>
      </div>
    </div>
  );
}

function OrderSuccess({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#272014]/40 px-5 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-[28px] bg-[#fffaf4] p-8 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#dff7e8] text-[#1e9b5a]"><Check className="h-9 w-9" /></div>
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-[#1e9b5a]">Đặt món thành công</p>
        <h2 className="mt-2 font-display text-3xl font-black text-[#272014]">Bếp đã nhận đơn!</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#7d756b]">Mã đơn <strong className="text-[#272014]">QB-2409</strong> đang được chuẩn bị. Tài xế sẽ đến trong khoảng 25–35 phút.</p>
        <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-white p-4 text-left"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0e9] text-[#f04b2d]"><Truck className="h-5 w-5" /></div><div><p className="text-xs font-bold text-[#272014]">Đang chuẩn bị món</p><p className="mt-1 text-xs text-[#9a8f83]">Bếp QuickBite • 12 Nguyễn Huệ</p></div></div>
        <Button onClick={onClose} className="mt-7 h-11 w-full rounded-full bg-[#272014] font-bold hover:bg-[#f04b2d]">Tiếp tục xem món</Button>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("Tất cả");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("quickbite-cart");
      if (stored) setCart(JSON.parse(stored) as CartLine[]);
    } catch {
      // Ignore unavailable localStorage.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("quickbite-cart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeCategory === "Tất cả" || product.category === activeCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.description}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }), [activeCategory, search]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} đã thêm vào giỏ`, { description: "Bạn có thể tiếp tục chọn món hoặc thanh toán ngay." });
  };

  const changeQuantity = (id: number, delta: number) => {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (id: number) => setCart((current) => current.filter((item) => item.id !== id));

  const openPayment = () => {
    if (cart.length === 0) return;
    setCartOpen(false);
    setPaymentOpen(true);
  };

  const checkout = () => {
    setCart([]);
    setPaymentOpen(false);
    setOrderSuccess(true);
    toast.success("Đơn hàng đã được gửi đến bếp");
  };

  const scrollToMenu = () => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#fffaf4] font-sans text-[#272014]">
      <header className="sticky top-0 z-40 border-b border-[#ede7dc]/80 bg-[#fffaf4]/95 backdrop-blur-md">
        <div className="container flex h-[76px] items-center justify-between gap-5">
          <a href="#top" className="flex shrink-0 items-center gap-2.5"><span className="grid h-10 w-10 rotate-[-6deg] place-items-center rounded-[13px] bg-[#f04b2d] text-white shadow-[0_7px_15px_rgba(240,75,45,0.22)]"><Zap className="h-5 w-5 fill-current" /></span><span className="font-display text-[22px] font-black tracking-[-0.06em]">quick<span className="text-[#f04b2d]">bite</span><sup className="ml-0.5 text-[10px] text-[#f04b2d]">®</sup></span></a>
          <nav className="hidden items-center gap-8 text-sm font-bold text-[#756b5e] md:flex"><a href="#menu" className="transition hover:text-[#f04b2d]">Thực đơn</a><a href="#story" className="transition hover:text-[#f04b2d]">Vì sao QuickBite?</a><a href="#reviews" className="transition hover:text-[#f04b2d]">Đánh giá</a></nav>
          <div className="flex items-center gap-2"><Link href="/admin" className="hidden rounded-full px-3 py-2 text-xs font-bold text-[#756b5e] hover:bg-[#f4eee5] sm:block">Quản lý quán</Link><button onClick={startLogin} className="hidden rounded-full border border-[#e8dfd2] px-4 py-2 text-xs font-bold text-[#4b4237] transition hover:border-[#f04b2d] hover:text-[#f04b2d] sm:block">Đăng nhập</button><button onClick={() => setCartOpen(true)} aria-label="Mở giỏ hàng" className="relative grid h-11 w-11 place-items-center rounded-full bg-[#272014] text-white transition hover:bg-[#f04b2d]"><ShoppingBag className="h-5 w-5" />{cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f04b2d] px-1 text-[10px] font-black ring-2 ring-[#fffaf4]">{cartCount}</span>}</button></div>
        </div>
      </header>

      <main id="top">
        <section className="container relative overflow-hidden pb-16 pt-12 md:pb-24 md:pt-20">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#ffd9bd]/70 blur-3xl" /><div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#ffeeb6]/50 blur-3xl" />
          <div className="relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5c7b6] bg-[#fff0e9] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#e04a2b]"><Sparkles className="h-3.5 w-3.5" /> Ngon hơn mỗi ngày</div>
              <h1 className="font-display text-[clamp(3.2rem,7vw,6.7rem)] font-black leading-[0.91] tracking-[-0.085em] text-[#272014]">Đói là phải <span className="text-[#f04b2d]">ăn ngon.</span></h1>
              <p className="mt-7 max-w-md text-base leading-7 text-[#756b5e] md:text-lg">Món nhanh làm thật, giao thật tốc độ. Từ chiếc burger nóng hổi đến phần khoai giòn tan — QuickBite luôn sẵn sàng cho cơn đói của bạn.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3"><Button onClick={scrollToMenu} className="h-12 rounded-full bg-[#f04b2d] px-6 text-sm font-black shadow-[0_12px_25px_rgba(240,75,45,0.23)] hover:bg-[#d93a20]">Khám phá thực đơn <ArrowRight className="h-4 w-4" /></Button><div className="flex items-center gap-2 px-2 text-sm text-[#756b5e]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#fff0cc] text-[#b7761e]"><Clock3 className="h-4 w-4" /></span><span><strong className="block text-[#272014]">25–35 phút</strong><span className="text-xs">giao tận nơi</span></span></div></div>
              <div className="mt-10 flex items-center gap-4"><div className="flex -space-x-2"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#fffaf4] bg-[#eab18b] text-xs">👩🏻</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#fffaf4] bg-[#c4d3b2] text-xs">👨🏽</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#fffaf4] bg-[#e9c2c9] text-xs">👩🏾</span></div><span className="text-xs font-semibold text-[#8c8174]">Hơn <strong className="text-[#272014]">12.000+</strong> tín đồ ăn ngon</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-[630px] lg:ml-auto"><div className="absolute -left-4 top-10 z-10 rounded-2xl bg-white p-3 shadow-[0_14px_35px_rgba(39,32,20,0.13)]"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dff7e8] text-[#1e9b5a]"><Truck className="h-4 w-4" /></span><div><p className="text-[10px] font-black uppercase tracking-wider text-[#9a8f83]">Đang giao</p><p className="text-xs font-bold text-[#272014]">Đến trong 8 phút</p></div></div></div><div className="absolute -bottom-5 -right-2 z-10 rounded-2xl bg-[#272014] px-4 py-3 text-white shadow-[0_14px_35px_rgba(39,32,20,0.18)]"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#f8c6a8]">Hôm nay có deal</p><p className="mt-1 font-display text-xl font-black">Combo -20%</p></div><div className="relative aspect-[1.04] overflow-hidden rounded-[36px] bg-[#e7c49f] shadow-[0_25px_60px_rgba(129,76,34,0.17)]"><img src="/manus-storage/burger-fries_0e0770fe.jpg" alt="Burger và khoai tây chiên QuickBite" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-tr from-[#272014]/35 via-transparent to-white/10" /><span className="absolute bottom-7 left-7 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-[#272014]">Smash it. Love it.</span></div></div>
          </div>
        </section>

        <section className="border-y border-[#ede7dc] bg-white/65"><div className="container grid gap-4 py-5 sm:grid-cols-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0e9] text-[#f04b2d]"><Zap className="h-4 w-4" /></span><div><p className="text-xs font-black text-[#272014]">Nóng hổi mỗi đơn</p><p className="text-[11px] text-[#948a7e]">Làm sau khi bạn đặt</p></div></div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff5d8] text-[#c28a21]"><Truck className="h-4 w-4" /></span><div><p className="text-xs font-black text-[#272014]">Giao nhanh nội thành</p><p className="text-[11px] text-[#948a7e]">Miễn phí từ 180.000đ</p></div></div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf6ed] text-[#2c9b58]"><Check className="h-4 w-4" /></span><div><p className="text-xs font-black text-[#272014]">Đổi món dễ dàng</p><p className="text-[11px] text-[#948a7e]">Hỗ trợ tận tâm 7 ngày/tuần</p></div></div></div></section>

        <section id="menu" className="container scroll-mt-24 py-16 md:py-24"><div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#f04b2d]">Chọn món yêu thích</p><h2 className="font-display text-4xl font-black tracking-[-0.06em] text-[#272014] md:text-5xl">Thực đơn <span className="text-[#f04b2d]">hết sảy.</span></h2></div><div className="relative w-full md:w-64"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a59a8d]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm món nhanh..." className="h-11 rounded-full border-[#e8dfd2] bg-white pl-10 text-sm focus-visible:ring-[#f04b2d]/30" /></div></div><div className="mb-9 flex gap-2 overflow-x-auto pb-2">{categories.map((category) => <button key={category.label} onClick={() => setActiveCategory(category.label)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition ${activeCategory === category.label ? "bg-[#272014] text-white shadow-md" : "border border-[#e8dfd2] bg-white text-[#7d756b] hover:border-[#f04b2d] hover:text-[#f04b2d]"}`}><span>{category.emoji}</span>{category.label}</button>)}</div>{filteredProducts.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onFavorite={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])} onAdd={() => addToCart(product)} />)}</div> : <div className="rounded-3xl border border-dashed border-[#e3d7c7] bg-white p-12 text-center"><p className="font-display text-xl font-black">Không tìm thấy món phù hợp</p><p className="mt-2 text-sm text-[#8d8276]">Thử đổi từ khóa hoặc chọn một danh mục khác nhé.</p></div>}</section>

        <section id="combos" className="container scroll-mt-24 pb-16 md:pb-24"><div className="rounded-[30px] bg-[#fff0e9] p-6 md:p-9"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#f04b2d]">Chọn nhanh cho cả nhóm</p><h2 className="font-display text-3xl font-black tracking-[-0.06em] text-[#272014]">Combo <span className="text-[#f04b2d]">đỡ nghĩ.</span></h2></div><button onClick={scrollToMenu} className="flex items-center gap-1 text-xs font-black text-[#f04b2d] hover:underline">Xem toàn bộ menu <ArrowRight className="h-3.5 w-3.5" /></button></div><div className="mt-7 grid gap-4 md:grid-cols-3"><button onClick={() => addToCart(products[0])} className="group flex items-center gap-4 rounded-2xl bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg"><img src={products[0].image} alt="Combo Solo Smash" className="h-20 w-20 rounded-xl object-cover" /><span className="min-w-0 flex-1"><strong className="block font-display text-lg font-black text-[#272014]">Solo Smash</strong><span className="mt-1 block text-xs text-[#8d8276]">Classic Smash + khoai + nước</span><span className="mt-2 block text-sm font-black text-[#f04b2d]">129.000đ</span></span><Plus className="h-5 w-5 text-[#f04b2d]" /></button><button onClick={() => addToCart(products[2])} className="group flex items-center gap-4 rounded-2xl bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg"><img src={products[2].image} alt="Combo Fiesta" className="h-20 w-20 rounded-xl object-cover" /><span className="min-w-0 flex-1"><strong className="block font-display text-lg font-black text-[#272014]">Fiesta Box</strong><span className="mt-1 block text-xs text-[#8d8276]">Pizza + 2 taco + 2 trà đào</span><span className="mt-2 block text-sm font-black text-[#f04b2d]">279.000đ</span></span><Plus className="h-5 w-5 text-[#f04b2d]" /></button><button onClick={() => addToCart(products[1])} className="group flex items-center gap-4 rounded-2xl bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg"><img src={products[1].image} alt="Combo Chicken" className="h-20 w-20 rounded-xl object-cover" /><span className="min-w-0 flex-1"><strong className="block font-display text-lg font-black text-[#272014]">Chicken Date</strong><span className="mt-1 block text-xs text-[#8d8276]">2 crispy chicken + loaded fries</span><span className="mt-2 block text-sm font-black text-[#f04b2d]">199.000đ</span></span><Plus className="h-5 w-5 text-[#f04b2d]" /></button></div></div></section>

        <section id="story" className="scroll-mt-24 bg-[#272014] text-white"><div className="container grid gap-12 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-24"><div><p className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#f6a083]">Không chỉ là đồ ăn nhanh</p><h2 className="font-display text-4xl font-black leading-[0.98] tracking-[-0.06em] md:text-6xl">Nhanh tay,<br /><span className="text-[#f36b4e]">tử tế</span> từ bếp.</h2><p className="mt-6 max-w-md text-sm leading-7 text-[#bdb3a5]">Chúng tôi chọn nguyên liệu mỗi sáng, làm sốt tại bếp và chỉ nấu khi bạn đặt. Vì một bữa ăn nhanh vẫn xứng đáng được làm thật ngon.</p><Button onClick={scrollToMenu} className="mt-7 rounded-full bg-white text-[#272014] hover:bg-[#f6a083]">Xem món hôm nay <ChevronRight className="h-4 w-4" /></Button></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[26px] bg-[#3a3024] p-6"><span className="text-3xl">🥬</span><h3 className="mt-6 font-display text-xl font-black">Nguyên liệu tươi</h3><p className="mt-2 text-sm leading-6 text-[#bdb3a5]">Nhập mới mỗi ngày từ nguồn địa phương.</p></div><div className="rounded-[26px] bg-[#f04b2d] p-6 sm:translate-y-7"><span className="text-3xl">🔥</span><h3 className="mt-6 font-display text-xl font-black">Nấu theo đơn</h3><p className="mt-2 text-sm leading-6 text-white/75">Món đến tay bạn luôn nóng và thơm.</p></div><div className="rounded-[26px] bg-[#f2c25b] p-6 text-[#272014]"><span className="text-3xl">🤝</span><h3 className="mt-6 font-display text-xl font-black">Phục vụ tử tế</h3><p className="mt-2 text-sm leading-6 text-[#554428]">Có vấn đề? Nhắn là chúng tôi xử lý.</p></div><div className="rounded-[26px] bg-[#e4e0d5] p-6 text-[#272014] sm:translate-y-7"><span className="text-3xl">🛵</span><h3 className="mt-6 font-display text-xl font-black">Giao đúng hẹn</h3><p className="mt-2 text-sm leading-6 text-[#756b5e]">Theo dõi đơn dễ dàng, không phải chờ đoán.</p></div></div></div></section>

        <section id="reviews" className="container scroll-mt-24 py-16 md:py-24"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#f04b2d]">Khách nói gì</p><h2 className="font-display text-4xl font-black tracking-[-0.06em] text-[#272014]">Ăn rồi là <span className="text-[#f04b2d]">ghiền.</span></h2></div><div className="flex items-center gap-2 rounded-full bg-[#fff0e9] px-4 py-2 text-sm font-bold text-[#9d513e]"><Star className="h-4 w-4 fill-current text-[#f4aa3d]" /> 4.9/5 từ 2.8k đánh giá</div></div><div className="mt-9 grid gap-5 md:grid-cols-3"><blockquote className="rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(39,32,20,0.06)]"><div className="flex gap-1 text-[#f4aa3d]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} className="h-4 w-4 fill-current" />)}</div><p className="mt-5 text-sm leading-7 text-[#5f564b]">“Burger ngon bất ngờ, bánh mềm mà thịt vẫn cháy cạnh. App đặt món mượt, đóng gói cũng xinh.”</p><footer className="mt-5 flex items-center gap-3 text-xs font-bold text-[#272014]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f6d0bb]">MA</span> Minh Anh • Quận 1</footer></blockquote><blockquote className="rounded-[24px] bg-[#f04b2d] p-6 text-white shadow-[0_8px_30px_rgba(240,75,45,0.17)]"><div className="flex gap-1 text-[#ffd49c]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} className="h-4 w-4 fill-current" />)}</div><p className="mt-5 text-sm leading-7 text-white/85">“Gọi combo taco pizza cho cả team, ai cũng hỏi link. Giao nhanh hơn dự kiến 10 phút.”</p><footer className="mt-5 flex items-center gap-3 text-xs font-bold"><span className="grid h-8 w-8 place-items-center rounded-full bg-white/25">QV</span> Quang Vũ • Bình Thạnh</footer></blockquote><blockquote className="rounded-[24px] bg-[#fff2c9] p-6 text-[#272014]"><div className="flex gap-1 text-[#d88923]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} className="h-4 w-4 fill-current" />)}</div><p className="mt-5 text-sm leading-7 text-[#5f564b]">“Thích nhất là phần note món, mình ăn cay nhẹ mà bếp làm đúng. Sẽ order lại dài dài.”</p><footer className="mt-5 flex items-center gap-3 text-xs font-bold"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9b7d2]">TL</span> Thảo Linh • Phú Nhuận</footer></blockquote></div></section>
      </main>

      <footer className="border-t border-[#ede7dc] bg-white"><div className="container flex flex-col justify-between gap-5 py-8 text-sm md:flex-row md:items-center"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 rotate-[-6deg] place-items-center rounded-[10px] bg-[#f04b2d] text-white"><Zap className="h-4 w-4 fill-current" /></span><span className="font-display text-lg font-black tracking-[-0.06em]">quick<span className="text-[#f04b2d]">bite</span></span></div><div className="flex flex-wrap items-center gap-4 text-xs text-[#8c8174]"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#f04b2d]" /> 12 Nguyễn Huệ, Q.1, TP.HCM</span><span>© 2026 QuickBite</span><Link href="/admin" className="font-bold text-[#f04b2d] hover:underline">Khu vực quản lý</Link></div></div></footer>

      {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onRemove={removeFromCart} onCheckout={openPayment} />}
      {paymentOpen && <PaymentModal total={calculateOrderTotal(subtotal)} onClose={() => setPaymentOpen(false)} onPaid={checkout} />}
      {orderSuccess && <OrderSuccess onClose={() => setOrderSuccess(false)} />}
    </div>
  );
}
