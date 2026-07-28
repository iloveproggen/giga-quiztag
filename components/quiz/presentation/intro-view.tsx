import type { Team } from '@/components/quiz/config';
import { TeamAvatar } from '@/components/quiz/ui';
import { generateBuzzerQRCode } from '../utils/generateBuzzerQRCode';

export function IntroView({
  teams = [],
}: {
  teams?: Team[];
}) {
  return (
    <div>
      <header className="ui-panel border-slate-800 bg-slate-900 px-20 py-20 text-white">
        <div>
          <div className="space-y-4 flex flex-row items-center justify-between">
            <div className="flex-col flex">
              <p className="text-9xl font-bold tracking-tight text-slate-200">
                Teams erstellen!
              </p>
              <p className="mt-10 text-5xl text-slate-300">Nutzt ein Handy pro Team und scannt den QR-Code.</p>
            </div>
            <section className="ui-panel px-6 py-6 text-slate-900">
              <div>
                {generateBuzzerQRCode(300)}
              </div>
            </section>
          </div>
        </div>
      </header>
      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 px-20 py-20 text-left text-white w-full h-full">
            <p className="text-5xl font-semibold tracking-tight text-slate-200">
              Aktuelle Teams
            </p>
        {teams.length > 0 ? (
          <div>
            <div className="grid max-h-[50vh] overflow-auto md:grid-cols-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center rounded-lg border-slate-800 bg-slate-950 px-5 py-5 mt-5 mr-5 text-left text-white"
                >
                  <div className="avatar w-16 h-16 flex border border-slate-800 items-center justify-center text-white">
                    {team.icon || team.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-md font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {team.id}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                      {team.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-base leading-7 text-slate-600">
              Noch keine!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
