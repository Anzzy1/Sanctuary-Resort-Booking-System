export function Footer() {
  return (
    <footer className="w-full py-16 bg-surface-container dark:bg-tertiary-container mt-20">
      <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="flex flex-col items-start col-span-1 md:col-span-1 mb-8 md:mb-0">
          <a className="font-display-lg text-headline-md text-primary dark:text-primary-fixed mb-4" href="#">
            Sanctuary
          </a>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container max-w-xs">
            A refined coastal retreat designed for absolute tranquility and connection with nature.
          </p>
        </div>
        <div className="col-span-1 flex flex-col space-y-4">
          <h4 className="font-headline-md text-[18px] text-primary dark:text-primary-fixed mb-2">
            Resort
          </h4>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-secondary transition-colors hover:opacity-80" href="#">
            Accommodations
          </a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-secondary transition-colors hover:opacity-80" href="#">
            Dining
          </a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-secondary transition-colors hover:opacity-80" href="#">
            Wellness
          </a>
        </div>
        <div className="col-span-1 flex flex-col space-y-4">
          <h4 className="font-headline-md text-[18px] text-primary dark:text-primary-fixed mb-2">
            Legal
          </h4>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-secondary transition-colors hover:opacity-80" href="#">
            Privacy Policy
          </a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-secondary transition-colors hover:opacity-80" href="#">
            Terms of Service
          </a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-secondary transition-colors hover:opacity-80" href="#">
            Contact Us
          </a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-secondary transition-colors hover:opacity-80" href="#">
            Careers
          </a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-secondary transition-colors hover:opacity-80" href="/admin">
            Admin
          </a>
        </div>
        <div className="col-span-1 md:col-span-4 mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center">
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container">
            © 2024 Sanctuary Coastal Resort. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}