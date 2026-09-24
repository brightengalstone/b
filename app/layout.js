import './globals.css';
import Link from 'next/link';
export const metadata={title:'BG Smart Services',description:'Local shopping, delivered in Eersterust'};
export default function Layout({children}){return <><header><Link href="/" className="brand"><span>BG</span> Smart Services</Link><nav><Link href="/marketplace">Marketplace</Link><Link href="/signin">Sign in</Link><Link href="/account">Account</Link><Link href="/cart">Cart</Link></nav></header><main>{children}</main><footer><b>BG Smart Services</b><span>Eersterust only • Delivery R60 • Service R45</span></footer></>}
