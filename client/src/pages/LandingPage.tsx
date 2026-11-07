import Navbar from "../components/landing/Navbar"
import Hero from "../components/landing/Hero"
import HowItWorks from "../components/landing/HowItWorks"
import Features from "../components/landing/Features"
import Pricing from "../components/landing/Pricing"
import FAQ from "../components/landing/FAQ"
import Footer from "../components/landing/Footer"
import DemoVideo from "../components/landing/DemoVideo"
const LandingPage = () => {
  return (
     <div className="landing-page">
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <DemoVideo/>
        <Features/>
        <Pricing/>
        <FAQ/>
        <Footer/>
      </main>
    </div>
  )
}

export default LandingPage