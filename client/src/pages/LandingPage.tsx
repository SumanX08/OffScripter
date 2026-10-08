import Navbar from "../components/landing/Navbar"
import Hero from "../components/landing/Hero"
import HowItWorks from "../components/landing/HowItWorks"
import Features from "../components/landing/Features"
import Pricing from "../components/landing/Pricing"
const LandingPage = () => {
  return (
     <div className="landing-page">
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Features/>
        <Pricing/>
      </main>
    </div>
  )
}

export default LandingPage