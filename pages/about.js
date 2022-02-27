import Link from "next/link"

export default function About() {
  return (
    <div className="mt-0">
      <main>
        <div className="py-6 md:py-12">
          <div className="px-4 mt-10">
            <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start flex flex-col lg:h-auto '>
              <div className="text-center max-w-2xl w-full md:w-4/12 mx-auto mt-4">
                <h1 className="text-3xl md:text-4xl text-indigo-600 font-medium py-4 mb-8">Energi <br/> is a Peer To Peer Decentralized Energy Sharing Platform.</h1>
              </div>
              <div className="text-center max-w-2xl w-full md:w-4/12 mx-auto mt-7 rounded-xl shadow-lg">
                <h1 className="text-xl md:text-4xl text-indigo-600 py-2 mb-6 helvetica">Building a decentralized platform where excess renewable energy can be publicly auctioned and sold.</h1>
              </div>
            </div>
            <div className="flex w-full justify-center">
              <button className="bg-indigo-600 text-white py-2 px-6 rounded-full text-xl mt-6 hover:bg-purple-700 transition-colors duration-300">
                <Link href="/marketplace">
                  <a>Explore</a>
                </Link>
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
