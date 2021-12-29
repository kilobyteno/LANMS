<div class="fixed bottom-0 left-0 z-50 w-64 p-6 mb-8 ml-8 font-sans bg-white rounded-lg shadow-2xl js-cookie-consent">
    <div class="relative w-16 mx-auto mb-3 -mt-12">
        <img class="-mt-1" src="{{ asset('/img/cookie.svg') }}" alt="cookie"/>
    </div>
    <span class="block w-full mb-3 leading-normal text-gray-800 text-md">
        {!! trans('cookie-consent::texts.message') !!}
    </span>
    <div class="flex items-center justify-between">
        <button type="button" class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md js-cookie-consent-agree hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2">
            {{ trans('cookie-consent::texts.agree') }}
        </button>
    </div>
</div>