import Link from "next/link"

export default function Home() {
  return (
    <div className="mt-0">
      <main>
        <div className="py-6 md:py-12">
          <div className="px-4 mx-10">
            <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full items-center flex flex-col lg:h-auto '>
              <div className="sm:flex-shrink-0 text-center max-w-2xl w-full md:w-5/12 mx-auto">
                <div className="mt-4">
                  <img src="https://i.ibb.co/Tqvpcb6/background.jpg" alt="mockup" className="d-block max-w-full rounded"/>
                </div>
              </div>
              <div className="text-center max-w-2xl w-full md:w-4/12 mx-auto mt-4">
                <h1 className="text-3xl md:text-4xl text-indigo-600 font-medium py-4 mb-8 select-none">Energi <br/> is a Peer To Peer Decentralized Energy Sharing Platform.</h1>
              </div>
            </div>
          <div className="flex w-full justify-center">
            <button className="bg-blue-700 hover:bg-indigo-800 text-white py-2 px-6 rounded-full text-xl mt-6 transition-colors duration-300">
              <Link href="/marketplace">
                <a>
                Explore
                </a>
              </Link>
            </button>
          </div>
          </div>
        </div>
      </main>
    </div>
  )
}
