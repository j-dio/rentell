import MockDataNotice from '@/components/MockDataNotice'

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MockDataNotice />
      {children}
    </>
  )
}
