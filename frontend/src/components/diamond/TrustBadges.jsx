import { LuShield, LuAward, LuZap } from "react-icons/lu";

export default function TrustBadges() {
  const badges = [
    { icon: LuShield, title: "GIA / IGI Certified", desc: "Independent grading reports" },
    { icon: LuAward, title: "Lifetime Buyback", desc: "Satisfaction & value protection" },
    { icon: LuZap, title: "Fast Delivery", desc: "Insured & tracked shipping" }
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/0 p-4 rounded-lg">
      {badges.map((b, i) => (
        <div key={i} className="flex items-start gap-4 bg-white/90 p-4 rounded-2xl shadow-sm border border-gray-100 w-full md:w-1/3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <b.icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-[#111111]">{b.title}</h4>
            <p className="text-sm text-gray-600">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

