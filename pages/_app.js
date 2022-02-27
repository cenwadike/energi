import '../styles/globals.css' 
import Head from '../Components/Header'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

function MarketPlace({ Component, pageProps }) {
  return(
    <div>
      <Head />
      <div className="bg-white width: 100%">
        <Navbar />
        <div>
          <Component {...pageProps} />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MarketPlace