import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnnouncementBanner from '@/components/AnnouncementBanner'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // #region agent log
  const fs = require('fs');
  const logPath = '/home/kifiya/mha/.cursor/debug.log';
  try {
    const logEntry = JSON.stringify({location:'layout.tsx:9',message:'FrontendLayout rendering',data:{hasChildren:!!children,nodeEnv:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}) + '\n';
    fs.appendFileSync(logPath, logEntry);
  } catch (e) {
    try {
      const errorLog = JSON.stringify({location:'layout.tsx:15',message:'FrontendLayout logging error',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}) + '\n';
      fs.appendFileSync(logPath, errorLog);
    } catch (e2) {}
  }
  // #endregion
  return (
    <>
      <Header />
      <AnnouncementBanner />
      <main>{children}</main>
      <Footer />
    </>
  )
}

